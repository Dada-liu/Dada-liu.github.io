# 个人作品集网站

一个纯前端的静态作品集网站，包含关于我、技能展示、项目作品、博客文章、工作经历和联系方式等功能模块。

## 页面结构 (Tabs)

| Tab | ID | 描述 |
|-----|-----|------|
| 关于我 | `#about` | 个人简介和介绍 |
| 技能 | `#skills` | 技术技能展示 |
| 项目 | `#projects` | 项目作品展示 |
| 博客 | `#blog` | 博客文章列表 |
| 博客详情 | `#blog-detail` | 单篇文章详情页 |
| 经历 | `#experience` | 工作经历时间线 |
| 联系方式 | `#contact` | 联系信息 |

## 特殊处理逻辑

### 1. 博客系统

**数据源**：`blogPosts` 数组 (script.js)

```javascript
const blogPosts = [
    {
        id: 'article-slug',
        title: '文章标题',
        excerpt: '文章简介',
        date: '2024-02-17',
        tag: '标签',
        image: '封面图片URL',
        content: 'blog/article-slug/content.md'
    }
];
```

**Markdown 解析**：
- `parseMarkdown(markdown)` - 解析 Markdown 为 HTML
- `fixImagePaths(html, articleId)` - 修复图片路径，添加文章文件夹前缀

图片路径转换：
- 绝对路径（如 `https://...`）保持不变
- 相对路径（如 `./assets/xxx.png`）转换为 `./blog/{articleId}/assets/xxx.png`

### 2. 博客详情页

- 点击博客卡片触发 `showBlogDetail(postId)`
- 动态加载 Markdown 文件内容
- 使用 fetch API 获取 `blog/{id}/content.md`
- 加载失败时显示占位内容

### 3. 响应式导航

**桌面端**：侧边栏导航
- 位于页面左侧固定定位
- 包含头像、姓名、社交链接、导航菜单
- 支持展开/收起功能（点击切换按钮）

**移动端**（≤768px）：
- 隐藏侧边栏
- 显示顶部简约导航栏
- 导航项：关于、技能、项目、博客、经历

### 4. Section 切换

`switchSection(targetId)` 函数处理：
- 隐藏所有 content-section
- 显示目标 section
- 更新桌面端和移动端导航的 active 状态
- 平滑滚动到顶部

### 5. 博客文章添加步骤

1. 在 `blogPosts` 数组中添加文章配置
2. 在 `blog/` 目录下创建文章文件夹 `{article-id}/`
3. 在文件夹中创建 `content.md` 文件
4. 如有图片，放在文章文件夹的 `assets/` 目录

## 文件结构

```
my-github-pages/
├── index.html          # 主页面结构
├── styles.css          # 样式文件
├── js/                 # JavaScript 目录
│   ├── script.js       # 交互逻辑
│   └── blog-posts.js   # 博客文章配置
├── blog/               # 博客文章目录
│   └── [article-id]/
│       ├── content.md  # 文章内容
│       └── assets/     # 文章图片
└── README.md           # 本文件
```

## 技术特点

- 纯前端无框架依赖
- 响应式设计（桌面端 + 移动端）
- Markdown 静态博客
- 平滑过渡动画
