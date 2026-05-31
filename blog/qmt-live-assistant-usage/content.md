## 1、适用场景

QMT-Live-Assistant 适用于以下量化交易工作流：

1. 在聚宽（JoinQuant）上进行研究、回测和模拟交易
2. 策略信号需要转发到实盘 miniQMT 执行
3. 一个 QMT 账号运行多个策略，需要独立管理各自的资金和持仓
4. 远程策略服务器（如云服务器）需要将信号推送到本地交易终端



## 2、安装

### 前提条件

- Windows 操作系统（xtquant SDK 仅支持 Windows）
- 已安装 Python 3.10+
- 已安装、选中“独立交易”，并登录 QMT 交易终端（券商版）

### 安装依赖

```bash
git clone https://github.com/Dada-liu/QMT-Live-Assistant.git
cd QMT-Live-Assistant
pip install -r requirements.txt
```

> 在 macOS/Linux 上开发调试时，项目自动使用 mock 模块模拟 XtQuant 接口。



## 3、启动服务器

```bash
python -m backend.main --port 8000
```

浏览器打开 `http://localhost:8000`：

1. 在配置页面填写账户 ID（券商资金账号）和 QMT 路径
2. QMT 路径示例：`C:\国金QMT交易端模拟\userdata_mini`
3. 点击「启动服务器」

连接成功后，页面会显示服务器状态和 Token。

## 4、在聚宽中配置，实现远程信号下单

### 信号格式

远程策略服务器向 `POST /api/receive-signal` 发送 JSON：

```json
{
  "signal_id": "sig-20260531-001",
  "stock_code": "000001.XSHE",
  "direction": "buy",
  "quantity": 100,
  "price": 12.50,
  "order_type": "limit",
  "strategy_name": "momentum-v1"
}
```

### 认证方式

请求头携带策略 Token：`X-Token: <策略Token>`

服务器根据 Token 识别策略，下单后自动更新该策略的持仓和资金数据。

### 信号字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| signal_id | string | 是 | 信号唯一标识，用于去重 |
| stock_code | string | 是 | 聚宽格式股票代码（如 000001.XSHE） |
| direction | string | 是 | buy 或 sell |
| quantity | number | 是 | 下单数量（股） |
| price | number | 否 | 限价单价格，不填则为市价单 |
| order_type | string | 是 | limit（限价）或 market（市价） |
| strategy_name | string | 否 | 策略名称，用于前端展示 |



## 5、监控信号

在「买卖监控」标签页：

- 实时展示所有信号记录，每 5 秒自动刷新
- 每条信号显示：时间、策略、股票代码、方向、数量、价格、状态
- 买入信号绿色标识，卖出信号红色标识


## 6、安全注意事项

- 服务器主 Token 每次启动随机生成，仅在 `/api/start-server` 响应中返回一次
- 每个策略的 Token 独立生成，创建后立即展示一次，**务必复制保存**
- Token 存储在前端 Session Storage 中，关闭标签页即清除
- 不要在公网暴露服务器端口，建议仅监听 127.0.0.1
- 若需远程访问，务必配置防火墙规则或使用 VPN



## 7、常见问题

**Q: 连接 QMT 失败？**
- 确认 QMT 交易终端已登录
- 检查 QMT 路径是否正确（路径指向 `userdata_mini` 目录）
- 确认账户 ID 无误

**Q: 信号发送成功但没有下单？**
- 检查 `direction` 字段是否为 `buy` 或 `sell`
- 检查策略是否启用（`enabled: true`）
- 查看服务器日志确认具体错误

**Q: mac 上能运行吗？**
- 可以运行服务器和前端进行开发调试
- 实际下单需要 Windows 环境下的 XtQuant SDK
- mock 模式返回模拟数据，可验证功能流程
