## 1、整体思路

聚宽的在线回测环境和模拟交易环境均不支持直接向外发送 HTTP 请求。因此，将聚宽信号发送到 QMT-Live-Assistant 的可行方案是：

1. 在聚宽上完成策略的研究、回测、模拟
2. 将策略代码导出到本地或云服务器
3. 服务器运行策略，产生买卖信号后通过 HTTP 发送到 QMT-Live-Assistant
4. QMT-Live-Assistant 接收信号后调用 miniQMT 下单

```
聚宽（研究/回测） → 导出策略代码 → 云服务器运行 → HTTP 信号 → QMT-Live-Assistant → miniQMT 下单
```



## 2、导出聚宽策略代码

### 2.1 获取策略持仓信号

在聚宽研究环境中，可以通过 API 获取模拟交易的持仓和信号：

```python
import requests
import json

# 聚宽模拟交易API地址
JQ_BASE_URL = "https://www.joinquant.com/api"

# 获取当前持仓
def get_positions(context):
    return context.portfolio.positions

# 获取可用资金
def get_available_cash(context):
    return context.portfolio.available_cash
```

### 2.2 策略中的信号生成逻辑

以下是一个典型的均线交叉策略示例，在产生买卖信号时同时生成可发送的信号数据：

```python
import datetime

class SignalGenerator:
    def __init__(self):
        self.signals = []
    
    def check_ma_cross(self, stock, fast_ma, slow_ma):
        """检测均线交叉，生成信号"""
        if fast_ma > slow_ma and self.previous_fast <= self.previous_slow:
            # 金叉买入信号
            return {
                "signal_id": f"sig-{stock}-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                "stock_code": stock,
                "direction": "buy",
                "quantity": self.calculate_quantity(stock),
                "order_type": "market",
                "strategy_name": "ma-cross-v1"
            }
        elif fast_ma < slow_ma and self.previous_fast >= self.previous_slow:
            # 死叉卖出信号
            return {
                "signal_id": f"sig-{stock}-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                "stock_code": stock,
                "direction": "sell",
                "quantity": self.get_position_quantity(stock),
                "order_type": "market",
                "strategy_name": "ma-cross-v1"
            }
        return None
    
    def calculate_quantity(self, stock):
        """根据可用资金计算买入数量"""
        # 返回整数股数
        return 100  # 示例：固定买入100股
    
    def get_position_quantity(self, stock):
        """获取当前持仓数量"""
        return 100  # 示例：假设持仓100股
```



## 3、在云服务器上部署策略

### 3.1 项目结构

```
strategy-server/
├── strategy.py        # 策略逻辑（从聚宽导出）
├── signal_sender.py   # 信号发送模块
├── config.py          # 配置文件
└── requirements.txt   # 依赖
```

### 3.2 信号发送模块

```python
# signal_sender.py
import requests
import json
import logging

logger = logging.getLogger(__name__)

class SignalSender:
    """向 QMT-Live-Assistant 发送交易信号"""
    
    def __init__(self, qmt_server_url, strategy_token):
        """
        Args:
            qmt_server_url: QMT-Live-Assistant 地址，如 http://127.0.0.1:8000
            strategy_token: 策略的独立 Token
        """
        self.base_url = qmt_server_url.rstrip('/')
        self.token = strategy_token
        self.headers = {
            'Content-Type': 'application/json',
            'X-Token': self.token
        }
    
    def send_signal(self, signal):
        """发送单个交易信号
        
        Args:
            signal: 信号字典，包含 signal_id, stock_code, direction, quantity 等字段
        
        Returns:
            dict: API 响应
        """
        url = f"{self.base_url}/api/receive-signal"
        
        payload = {
            "signal_id": signal["signal_id"],
            "stock_code": signal["stock_code"],
            "direction": signal["direction"],
            "quantity": signal["quantity"],
            "order_type": signal.get("order_type", "market"),
            "strategy_name": signal.get("strategy_name", ""),
        }
        
        # 如果是限价单，添加价格
        if signal.get("price") and signal["order_type"] == "limit":
            payload["price"] = signal["price"]
        
        try:
            response = requests.post(url, json=payload, headers=self.headers, timeout=10)
            response.raise_for_status()
            result = response.json()
            logger.info(f"信号发送成功: {signal['signal_id']}, 方向: {signal['direction']}, 股票: {signal['stock_code']}")
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"信号发送失败: {signal['signal_id']}, 错误: {e}")
            return {"success": False, "error": str(e)}
    
    def send_batch_signals(self, signals):
        """批量发送信号
        
        Args:
            signals: 信号列表
        
        Returns:
            list: 每个信号的发送结果
        """
        results = []
        for signal in signals:
            result = self.send_signal(signal)
            results.append(result)
        return results
    
    def test_connection(self):
        """测试与 QMT-Live-Assistant 的连接"""
        url = f"{self.base_url}/health"
        try:
            response = requests.get(url, timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False
```

### 3.3 配置管理

```python
# config.py
import os

class Config:
    # QMT-Live-Assistant 服务器地址
    QMT_SERVER_URL = os.getenv('QMT_SERVER_URL', 'http://127.0.0.1:8000')
    
    # 策略 Token（从 QMT-Live-Assistant 策略管理中获取）
    STRATEGY_TOKEN = os.getenv('STRATEGY_TOKEN', '')
    
    # 策略运行参数
    TRADING_INTERVAL = 60  # 交易检查间隔（秒）
    STOCK_POOL = [
        '000001.XSHE',  # 平安银行
        '600519.XSHG',  # 贵州茅台
    ]
```

### 3.4 主程序整合

```python
# main.py
import time
import logging
from datetime import datetime
from signal_sender import SignalSender
from strategy import MyStrategy
from config import Config

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    # 初始化信号发送器
    sender = SignalSender(
        qmt_server_url=Config.QMT_SERVER_URL,
        strategy_token=Config.STRATEGY_TOKEN
    )
    
    # 测试连接
    if not sender.test_connection():
        logger.error("无法连接到 QMT-Live-Assistant，请检查服务器是否启动")
        return
    
    logger.info("连接 QMT-Live-Assistant 成功，开始运行策略...")
    
    # 初始化策略
    strategy = MyStrategy(Config.STOCK_POOL)
    
    # 主循环
    while True:
        try:
            current_time = datetime.now()
            
            # 只在交易时段运行（9:30-15:00）
            if not is_trading_time(current_time):
                time.sleep(60)
                continue
            
            # 执行策略逻辑，获取信号
            signals = strategy.run()
            
            if signals:
                logger.info(f"产生 {len(signals)} 个交易信号")
                results = sender.send_batch_signals(signals)
                
                for signal, result in zip(signals, results):
                    if result.get('success'):
                        logger.info(f"✓ {signal['stock_code']} {signal['direction']}")
                    else:
                        logger.error(f"✗ {signal['stock_code']} {signal['direction']}: {result.get('error')}")
            
            # 等待下一次检查
            time.sleep(Config.TRADING_INTERVAL)
            
        except KeyboardInterrupt:
            logger.info("策略运行已停止")
            break
        except Exception as e:
            logger.error(f"策略运行异常: {e}")
            time.sleep(60)

def is_trading_time(dt):
    """判断是否为交易时间"""
    if dt.weekday() >= 5:  # 周末
        return False
    time_str = dt.strftime('%H:%M')
    return '09:30' <= time_str <= '15:00'

if __name__ == '__main__':
    main()
```

### 3.5 依赖文件

```
# requirements.txt
requests>=2.28.0
```



## 4、运行流程

### Step 1：启动 QMT-Live-Assistant

```bash
cd QMT-Live-Assistant
python -m backend.main --port 8000
```

打开浏览器 `http://localhost:8000`，配置并启动服务器。

### Step 2：创建策略并获取 Token

在「配置」标签页的策略管理区块，创建策略（如 `ma-cross-v1`），复制生成的策略 Token。

### Step 3：配置策略服务器

```bash
export QMT_SERVER_URL=http://127.0.0.1:8000
export STRATEGY_TOKEN=<第2步复制的Token>
```

### Step 4：启动策略服务器

```bash
cd strategy-server
python main.py
```

### Step 5：在 QMT-Live-Assistant 监控信号

打开「买卖监控」标签页，可以实时看到来自策略服务器的信号和下单结果。



## 5、局域网 / 云服务器部署

如果策略服务器和 QMT-Live-Assistant 不在同一台机器上：

**场景一：策略服务器在云服务器，QMT 在本地 Windows**

由于 QMT 必须在 Windows 上运行，需要将 QMT-Live-Assistant 的端口暴露给云服务器：

- 使用 frp、ngrok 等内网穿透工具
- 或通过 VPN 将两台机器组成内网

```bash
# 云服务器（策略服务器）配置
export QMT_SERVER_URL=http://<本地公网IP或穿透域名>:8000
```

**场景二：两台机器在同一局域网**

```bash
# 策略服务器配置
export QMT_SERVER_URL=http://192.168.1.100:8000
```

> 注意：不要在公网直接暴露 QMT-Live-Assistant 端口，务必使用 VPN 或内网穿透 + 额外的安全措施。



## 6、信号去重与幂等

QMT-Live-Assistant 通过 `signal_id` 进行去重。确保每个信号有唯一 ID：

```python
import uuid
from datetime import datetime

def generate_signal_id(stock_code):
    """生成唯一信号ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    unique_part = uuid.uuid4().hex[:6]
    return f"sig-{stock_code.replace('.', '-')}-{timestamp}-{unique_part}"
```

如果同一个 `signal_id` 重复发送，后端会识别并拒绝，避免重复下单。



## 7、完整示例：日线均线策略

```python
# ma_cross_strategy.py
import numpy as np
from signal_sender import SignalSender
from config import Config

class MACrossStrategy:
    def __init__(self, stocks, fast_period=5, slow_period=20):
        self.stocks = stocks
        self.fast_period = fast_period
        self.slow_period = slow_period
        self.positions = {}           # {stock_code: quantity}
        self.previous_fast = {}       # {stock_code: 上期快线值}
        self.previous_slow = {}       # {stock_code: 上期慢线值}
        self.sender = SignalSender(Config.QMT_SERVER_URL, Config.STRATEGY_TOKEN)
    
    def get_price_data(self, stock, days=60):
        """获取股票历史价格（实际使用时替换为真实数据源）"""
        # 这里用聚宽API或tushare等数据源获取
        # import jqdatasdk as jq
        # df = jq.get_price(stock, count=days, frequency='daily', fields=['close'])
        pass
    
    def run(self):
        """执行策略，返回交易信号列表"""
        signals = []
        
        for stock in self.stocks:
            # 获取历史价格
            closes = self.get_price_data(stock)
            if closes is None or len(closes) < self.slow_period:
                continue
            
            # 计算均线
            fast_ma = np.mean(closes[-self.fast_period:])
            slow_ma = np.mean(closes[-self.slow_period:])
            
            prev_fast = self.previous_fast.get(stock, fast_ma)
            prev_slow = self.previous_slow.get(stock, slow_ma)
            
            quantity = 100  # 简化：固定100股
            
            # 金叉买入
            if prev_fast <= prev_slow and fast_ma > slow_ma:
                if self.positions.get(stock, 0) == 0:
                    signals.append({
                        "signal_id": generate_signal_id(stock),
                        "stock_code": stock,
                        "direction": "buy",
                        "quantity": quantity,
                        "order_type": "market",
                        "strategy_name": "ma-cross-v1"
                    })
                    self.positions[stock] = quantity
            
            # 死叉卖出
            elif prev_fast >= prev_slow and fast_ma < slow_ma:
                if self.positions.get(stock, 0) > 0:
                    signals.append({
                        "signal_id": generate_signal_id(stock),
                        "stock_code": stock,
                        "direction": "sell",
                        "quantity": self.positions[stock],
                        "order_type": "market",
                        "strategy_name": "ma-cross-v1"
                    })
                    self.positions[stock] = 0
            
            # 更新上期值
            self.previous_fast[stock] = fast_ma
            self.previous_slow[stock] = slow_ma
        
        return signals
```
