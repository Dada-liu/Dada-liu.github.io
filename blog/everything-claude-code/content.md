# Everything Claude Code

<!-- 在这里编写你的文章内容 -->





# Claude Code



### 1、介绍

claude code 是一个基于大语言模型的对话助手，已经通过微调和使用RLHF训练，变得更加有用、诚实、无害；



### 2、 基本的使用

安装完成之后直接在命令行通过`claude`命令开启；



国内安装完后修改 `~/.claude/setting.json` 中的 base url 和 key，然后在通过 `claude` 进入；



通过`/status`查看配置的模型状态；



### 3、功能

1. 子代理

   通过`/agents` 去查看和新建

2. 计划模式

   claude只能通过只读操作分析代码库；

   - 通过 `Shift`+`Tab` 来在 普通模式、自动接受模式、计划模式 三个模式之间切换；

   - 直接开始计划模式的新对话

     ```bash
     claude --permision-mode plan
     ```

   - 在配置文件中将计划模式设为默认配置

     ```js
     // .claude/settings.json
     {
       "permissions": {
     		"defaultMode": "plan"
       }
     }
     ```

     

3. 处理图像

   可以通过：

   - 直接将图片拖放到命令行窗口
   - 复制并且通过`ctrl`+`v` 粘贴到命令行中
   - 向claude提供图像路径

   

4. 引用文件、文件夹、MCP资源

   - 引用文件、文件夹：直接使用`@`来引用就可以了
   - 应用MCP资源：使用`@server:resource` 的格式，代表从名为 server 的 mcp 服务器获取 resource 这个资源

   tips：

   - 文件路径可以是相对的或绝对的
   - @ 文件引用会将文件目录和父目录中的 CLAUDE.md 添加到上下文中
   - 目录引用显示文件列表，而不是内容
   - 您可以在单个消息中引用多个文件（例如，“@file1.js and @file2.js”）

   

5. 使用扩展思考

   think 这个关键词会触发claude的思考模式

   

6. 恢复之前的对话

   ```bash
   # 继续最近的对话
   claude --continue
   
   # 列出最近的所有对话
   claude --resume
   
   ```

   

7. 使用 git worktrees 运行并行 Claude Code 会话

   https://docs.claude.com/zh-CN/docs/claude-code/common-workflows#%E4%BD%BF%E7%94%A8-git-worktrees-%E8%BF%90%E8%A1%8C%E5%B9%B6%E8%A1%8C-claude-code-%E4%BC%9A%E8%AF%9D

8. 将 Claude 用作 unix 风格的使用程序

   https://docs.claude.com/zh-CN/docs/claude-code/common-workflows#%E5%B0%86-claude-%E7%94%A8%E4%BD%9C-unix-%E9%A3%8E%E6%A0%BC%E7%9A%84%E5%AE%9E%E7%94%A8%E7%A8%8B%E5%BA%8F

   ```bash
   # 以非交互模式输出
   claude -p "解释文件 src/components/Header.tsx"
   ```

   

9. 创建自定义斜杆命令

   https://docs.claude.com/zh-CN/docs/claude-code/common-workflows#%E5%B0%86-claude-%E7%94%A8%E4%BD%9C-unix-%E9%A3%8E%E6%A0%BC%E7%9A%84%E5%AE%9E%E7%94%A8%E7%A8%8B%E5%BA%8F











### 4、基本命令

```bash
# 更新 claude cli
claude update

# 自动确认
claude --dangerously-skip-permission

# 继续最近对话
claude -c

# 恢复对话
claude -r
```



进入交互模式时



```bash
# 退出、中断
ESC

# 初始化项目
/init

# 清除上下文
/clear

# 压缩上下文
/compact

# 查看claude配置
/config

# 查看花费
/cost

# 查看claude的状态（版本、模型、工作目录）
/status

# 删除整行
Ctrl + U

# 多行输入
Shift + Enter

# 基于 git worktree，创建当前工作目录的分支
/fork <新分支名> [--base <基准分支>] [--path <工作目录路径>] [--isolate-env]

  <新分支名>：必填，如 feature/payment、bugfix/404；
  --base：可选，指定基准分支（默认当前分支），如 --base main；
  --path：可选，指定工作目录路径（默认在当前仓库同级目录生成）；
  --isolate-env：可选，强制完全隔离环境（如重新创建虚拟环境，而非复用）。

# 删除 /fork 命令创建的分支
/clean-fork

```







### 5、MCP 的使用



#### 1、添加MCP

```bash
# 1、添加本地运行的MCP服务器
claude mcp add <name> <command> [args...]

# eg：直接用 npx 来下载mcp到本地，再将本地的mcp添加到 claude code 中
claude mcp add airtable --env AIRTABLE_API_KEY=YOUR_KEY \
  -- npx -y airtable-mcp-server

# 2、添加远程 SSE 服务器
claude mcp add --transport sse <name> <url>

# 3、添加远程 HTTP 服务器
claude mcp add --transport http <name> <url>
```



用参数控制

```bash
# 用 --scope 指定mcp的安装范围
# https://docs.claude.com/en/docs/claude-code/mcp#managing-your-servers

# 用 --env 设置环境变量

```





#### 2、管理MCP

```bash
# 列出所有配置的服务器
claude mcp list

# 获取指定服务器的详细信息
claude mcp get <mcp-name>

# 删除服务器
claude mcp remove <mcp-name>

# （在 Claude Code）检查服务器状态
/mcp
```



#### 3、MCP 的介绍



##### 1、MCP 的架构

1. MCP 采用 Client-Server 架构，MCP主机（一个AI程序，eg：Claude Code）与每个 MCP服务器建立连接的过程：MCP主机为每一个MCP服务器创建一个MCP客户端，每个MCP客户端与其对应的MCP服务器提保持唯一的一对一连接；
2. MCP 由两层组成
   - 数据层：实现了一个基于 JSON-RCP 2.0 的交换协议
     - 生命周期：
     - 原语：定义了客户端和服务器可以为彼此提供的内容，MCP定义了可以公开的核心原语：
       - 服务器：Tools、Resources、Prompts
       - 客户端：Sampling、Elicitation、Logging
   - 通知：以实现服务器和客户端之间的动态通知，而不需要响应；
   - 传输层：管理客户端和服务器之间的通信通道和身份验证；支持 Stdio transport （基于标准输入输出）和 Streamable HTTP transport 两种传输机制



##### 2、服务器如何去工作

服务器通过三个核心模块（Tools、Resources、Prompts）提供功能；



1、Tools

工具是定义了输入输出的接口，大模型可以调用这些接口执行特定操作；



2、Resources

资源是从任意地方（文件、api、数据库等）提取的数据；

每个资源都有一个唯一的 URI；



3、Prompts

提示词是结构化的模板，定义了预期的输入



##### 3、客户端如何工作

MCP客户端由宿主程序实例化，用于与特定的MCP服务器进行通信；



##### 4、版本控制

MCP使用基于字符串的版本标识符，其格式为`YYYY-MM-DD`；



客户端和服务器的版本协商在初始化阶段时完成，客户端和服务器可以同时支持多个mcp版本，但是在一个会话中必须商定使用的唯一版本；





























#### 4、常用的一些MCP服务

1. playwright mcp: https://github.com/microsoft/playwright-mcp







### 6、Subagents 的使用



### 7、Checkpoints 的使用





### 6、配置文件

1、

全局配置文件在`~/.claude/setting.json` 下；

项目内配置文件在`.claude/settings.json` 下；





#### 2、通过 CLAUDE.md 管理 Claude 的记忆



1、在不同地方使用 CLAUDE.md

1. 系统级

   macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`

2. 项目级

   `./CLAUDE.md` or `./.claude/CLAUDE.md`

3. 用户级

   `~/.claude/CLAUDE.md`



所有层级的 CLAUDE.md 会在启动时自动加载到 Cladue Code 的上下文中；



2、CLAUDE.md 可以使用 `@` 导入其他文件

```markdown
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
git workflow @docs/git-instructions.md
```



1. 允许相对路径和绝对路径
2. 不会处理代码块中的`@`语句
3. 导入的文件可以递归导入其他文件，最大深度为5层



3、可以在启动的 Claude Code 中使用`/memory` 查看已经加载的记忆文件



4、在启动的 Claude Code 中可以使用`/init` 来初始化一个 `CLAUDE.md` 文件



5、

1. 



### end：使用的最佳实践



1、任务匹配

不同难度的任务使用不同的AI模型和工具



2、上下文超过模型的 50% 时，模型容易拉垮（大模型倦怠？）

1. 清理一下上下文再继续
2. 完成一个功能就清理一下上下文



3、每次AI生成代码后，过清单

[ ] 是否重用了现有系统？（别再造轮子了）
[ ] 错误处理完整吗？（生产环境可不能挂）
[ ] 有测试吗？（没测试的代码就是定时炸弹）
[ ] 性能影响评估了吗？（别让一个功能拖垮整个系统）
[ ] 安全检查过了吗？（千万别泄露敏感信息）
[ ] 有重复代码吗？（后期维护会哭的）
[ ] 依赖合理吗？（别引入一堆没用的包