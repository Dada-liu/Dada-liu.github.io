## 1、项目背景

QMT 是迅投推出的量化交易终端。miniQMT 是 QMT 的极简模式，通过 XtQuant SDK 提供 Python API 接口，支持程序化下单、获取账户资产、查询持仓等功能。

一般来说，刚入门量化的人都会通过 聚宽、果仁 之类的网站研究和学习量化，当学习到一定程度时，有了自己的策略，就会想要接入实盘，而通过 miniQMT 来实现实盘是一个流行的方案；
但是在实际操作过程中，如果要从聚宽转向 QMT，策略代码的重写就是一个麻烦事；参考了众多方案之后，这里我实现了一种方案并且提供对应的工具：
1. 研究、回测、模拟 继续留在 聚宽；
2. 提供本地 Web 应用来获取聚宽的买卖信号，并且转发给 miniQMT；

当前文章讨论的是项目的实现，项目的使用见：

## 2、技术架构

### 整体架构

```
远程策略服务器 --HTTP 信号--> Python 本地服务器 --XtQuant SDK--> miniQMT 交易终端
                                      |
                              前端管理界面（HTML/CSS/JS）
```

### 技术栈

- **后端**: Python 3.10+ / FastAPI / uvicorn / xtquant SDK
- **前端**: 原生 HTML + CSS + JavaScript（ES Module），Coinbase 设计风格


## 3、核心功能

### 3.1 连接管理

启动本地 FastAPI 服务器后，通过配置页面填写 QMT 账号信息（账号、密码、交易路径等），点击连接即可与 miniQMT 建立会话。连接成功后可以测试获取账户资产，包括可用资金、持仓市值、总资产、当日盈亏等数据。

### 3.2 多策略管理

一个 QMT 账号可能运行多个交易策略。后端将"策略"抽象为独立实体，每个策略拥有：

- 独立的可用资金和持仓
- 独立的总资产和当日盈亏
- 独立的买卖记录
- 独立的 Token 用于远程信号认证

所有策略数据相加等于当前 QMT 账号的总数据。前端提供策略的增删改查界面，每个策略自动生成对应的 Token。

### 3.3 远程信号接收

远程策略服务器通过 HTTP POST 发送交易信号到本地服务器：

- 信号携带策略 Token 进行身份关联
- 服务器根据信号内容自动调用 XtQuant 下单
- 下单完成后更新对应策略的持仓和资金数据
- 所有信号记录在监控面板中可追溯

### 3.4 实时监控

前端监控面板支持：

- 按日期筛选历史信号
- 按策略下拉筛选
- 实时展示信号状态（成功/失败/等待中）
- 策略概览区块展示各策略的核心指标

### 3.5 行情刷新

从 QMT 获取实时行情数据，自动刷新各策略持仓的市值和当日盈亏，确保前端数据与实际账户状态保持一致。



## 4、项目结构

```
QMT-live-assistant/
├── backend/
│   ├── main.py              # FastAPI 入口
│   ├── server.py            # QMTServer 核心
│   ├── qmt_client.py        # miniQMT 连接 + 代码转换
│   ├── signal_handler.py    # 远程信号接收
│   ├── strategy_manager.py  # 策略管理器
│   ├── utils.py             # 工具函数
│   ├── logger.py            # 日志系统
│   ├── constants.py         # 常量定义
│   └── mock_xtquant/        # 非 Windows 平台的 mock
├── frontend/
│   ├── index.html           # 单页应用
│   ├── styles.css           # Coinbase 风格样式
│   └── js/
│       ├── app.js           # 入口
│       ├── state.js         # 状态管理
│       ├── api.js           # API 客户端
│       ├── ui.js            # UI 工具
│       ├── config-panel.js  # 配置面板
│       ├── strategy.js      # 策略管理
│       ├── monitor.js       # 信号监控
│       └── theme.js         # 主题切换
├── config/                  # 配置文件
├── tests/                   # 测试
└── README.md
```



## 5、关键设计

### 5.1 API 认证

使用 Python `secrets.token_hex` 生成随机 Token：
- 服务器启动时生成全局 Token，保护所有管理 API
- 每个策略生成独立 Token，用于远程信号的身份关联
- 远程信号必须携带正确的策略 Token 才能被处理

### 5.2 非 Windows 平台兼容

XtQuant SDK 仅支持 Windows 平台。为了在 macOS 等环境下进行开发和测试，项目提供了 `mock_xtquant` 模块，模拟 XtQuant 的接口行为，返回模拟数据，使开发流程不依赖 Windows 环境。

### 5.3 聚宽格式转换

内置聚宽（JoinQuant）格式与 QMT 格式的股票代码转换功能。



## 6、界面设计

前端 UI 参考 Coinbase 的设计风格：

- 纯白底色 + 深色导航，简洁专业
- 亮/暗双主题一键切换
- 卡片式布局，信息层级清晰
- 表格数据展示，支持筛选和排序
- 响应式设计，适配不同屏幕尺寸

主要页面标签：

| 标签 | 功能 |
|------|------|
| QMT 账号 | 连接状态、账户资产、策略概览 |
| 买卖监控 | 实时信号列表、日期/策略筛选 |
| 配置 | 连接配置、策略管理（增删改查） |



## 7、开发 MVP 流程

项目采用分阶段开发：

1. 启动 miniQMT 终端
2. 启动本地服务器，连接 miniQMT，用获取可用金额测试连接
3. 实现聚宽代码转换功能
4. 实现信号监控面板

后续功能升级增加了多策略管理、Token 认证、实时行情刷新等功能。

项目源码已开源在 GitHub：[https://github.com/Dada-liu/QMT-Live-Assistant](https://github.com/Dada-liu/QMT-Live-Assistant)，欢迎交流。

## 8、参考链接

1、[xtQuant文档](https://dict.thinktrader.net/nativeApi/start_now.html)

2、[提供QMT的券商](https://zhuanlan.zhihu.com/p/692589718)

3、[聚宽API文档](https://www.joinquant.com/help/api/help#api:API%E6%96%87%E6%A1%A3)