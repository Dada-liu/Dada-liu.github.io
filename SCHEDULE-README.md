# 定时博客更新脚本

这个脚本可以自动在每天的指定时间向 `blog/ts-core/content.md` 文件中添加随机内容，并在每天23点将变更推送到远程仓库。

## 功能说明

1. **添加随机内容**：每天在以下两个时间段中随机选择一个时间添加一行随机内容：
   - 12:00-13:00 之间
   - 20:00-23:00 之间

2. **自动提交推送**：每天23:00自动执行以下git操作：
   - 检查是否有变更
   - 添加所有变更到暂存区
   - 创建提交（提交信息包含时间戳）
   - 推送到远程仓库

## 安装和使用方法

### 方法一：使用Node.js脚本（推荐）

1. **安装Node.js依赖**
   ```bash
   npm init -y
   npm install node-cron
   ```

2. **运行脚本**
   ```bash
   node schedule-blog-update.js run-schedule
   ```

   脚本会在后台运行，按以下计划执行：
   - 每天12:00-13:00随机时间添加内容
   - 每天20:00-23:00随机时间添加内容
   - 每天23:00提交并推送

   按 `Ctrl+C` 停止脚本。

### 方法二：使用系统Cron调度

1. **给脚本添加执行权限**
   ```bash
   chmod +x schedule-blog-update.js
   ```

2. **编辑crontab**
   ```bash
   crontab -e
   ```

3. **添加以下行**（注意修改 `/path/to/project` 为实际项目路径）
   ```
   # 每天12点和20点各运行一次，随机延迟0-60分钟或0-180分钟
   0 12,20 * * * sleep $((RANDOM \% 3600)) && cd /Users/yuliu/Desktop/daxia/code/my-github-pages && node schedule-blog-update.js add-random-line

   # 每天23点提交并推送
   0 23 * * * cd /Users/yuliu/Desktop/daxia/code/my-github-pages && node schedule-blog-update.js git-push
   ```

4. **保存并退出**

### 方法三：手动测试

- **添加随机内容**：
  ```bash
  node schedule-blog-update.js add-random-line
  ```

- **执行git推送**：
  ```bash
  node schedule-blog-update.js git-push
  ```

## 脚本说明

### 文件结构
- `schedule-blog-update.js` - 主脚本文件
- `blog/ts-core/content.md` - 目标博客文件

### 随机内容池
脚本内置了20条关于TypeScript的随机句子，每次随机选择一条添加到文件中。

### Git配置要求
- 确保已配置git用户名和邮箱
- 确保有远程仓库的推送权限
- 建议使用SSH密钥认证，避免每次输入密码

## 注意事项

1. **文件备份**：建议在执行前备份 `blog/ts-core/content.md` 文件。
2. **Git安全**：确保没有未提交的重要变更，脚本会添加所有变更并推送。
3. **时间设置**：脚本使用系统时间，请确保系统时间正确。
4. **运行环境**：脚本需要Node.js环境，建议使用Node.js 12或更高版本。
5. **错误处理**：脚本包含基本的错误处理，会记录错误日志到控制台。

## 自定义配置

如果需要修改随机内容，可以编辑 `schedule-blog-update.js` 文件中的 `RANDOM_CONTENTS` 数组。

如果需要修改时间安排，可以编辑cron表达式或修改脚本中的调度设置。

## 故障排除

- **如果脚本无法运行**：检查Node.js是否安装正确 `node --version`
- **如果git推送失败**：检查git配置和远程仓库权限
- **如果文件没有更新**：检查文件路径和权限
- **如果cron任务没有执行**：检查系统日志 `grep CRON /var/log/syslog` (Linux) 或查看macOS的控制台

## 停止自动更新

- **如果使用Node.js脚本**：按 `Ctrl+C` 停止
- **如果使用Cron**：编辑crontab删除相关行 `crontab -e`

---

**提示**：建议先在测试环境中运行，确认功能符合预期后再在生产环境使用。