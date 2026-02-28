# 用中文回复我所有的问题

git commit 时不要加 Co-Authored-By

---

## 项目信息

这是一个 GitHub Pages 个人作品集网站，包含以下功能：

### 技术栈
- 纯前端静态网站（HTML/CSS/JavaScript）
- 无构建工具/框架依赖
- 支持博客文章（Markdown 格式）

### 项目结构
```
my-github-pages/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 交互逻辑
├── blog/               # 博客文章目录
│   └── [article-id]/
│       └── content.md  # 文章内容（Markdown）
├── CLAUDE.md           # 本配置文件
└── [图片资源...]
```

### 主要功能模块
1. **About** - 个人介绍
2. **Skills** - 技能展示
3. **Projects** - 项目展示
4. **Blog** - 博客文章列表
5. **Experience** - 工作经历
6. **Contact** - 联系方式

### 添加新博客文章
在 `script.js` 的 `blogPosts` 数组中添加新配置：
```javascript
{
    id: 'article-slug',
    title: '文章标题',
    excerpt: '文章简介',
    date: '2024-02-17',
    tag: '标签',
    image: '封面图片URL',
    content: 'blog/article-slug/content.md'
}
```
然后在 `blog/article-slug/` 目录下创建 `content.md` 文件。