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

**数据源**：`blogPosts` 数组 (`js/blog-posts.js`)

```javascript
export const blogPosts = [
    {
        id: 'article-slug',
        title: '文章标题',
        excerpt: '文章简介',
        date: '2024-02-17',
        tags: ['标签1', '标签2'],
        image: '封面图片URL',
        content: 'blog/article-slug/content.md'
    }
];
```

### 2. 项目系统

**数据源**：`projects` 数组 (`js/projects.js`)

```javascript
export const projects = [
    {
        id: 'project-slug',
        title: '项目标题',
        description: '项目描述',
        image: '项目图片URL',
        tech: ['技术1', '技术2'],
        demoUrl: '演示链接',
        githubUrl: 'GitHub链接'
    }
];
```

**Markdown 解析**：
- `parseMarkdown(markdown)` - 解析 Markdown 为 HTML（async，首次调用时动态加载 micromark）
- `fixImagePaths(html, articleId)` - 修复图片路径，添加文章文件夹前缀
- micromark 及其 GFM 扩展体积大且首屏用不到，改为打开博客详情时才 `import()`，不进入首屏请求

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

## 性能约定

首屏只加载「文字 + 样式 + 交互脚本」，其余一律延后：

- **外部字体非阻塞**：`fonts.googleapis.com` 的样式表用 `media="print"` + `onload` 异步加载，首屏先用系统字体渲染；`styles.css` 的 `font-family` 保留了中文系统字体回退（PingFang SC / 微软雅黑），外网字体不可用时自动降级。
- **图片按需加载**：首屏之外、以及默认不可见（收起状态的侧边栏、未激活的 Tab、hover 弹层）的图片都加 `loading="lazy" decoding="async"`；首屏内的图片保持 eager，避免懒加载把首屏图片也推迟。
- **图片尺寸按实际显示尺寸的 2 倍生成 WebP**，不要直接塞原图（头像显示 110px，原图却有 1512×2016）。
- **Markdown 解析按需加载**：见上文 `parseMarkdown`，打开博客详情时才拉 micromark。

## 文件结构

```
my-github-pages/
├── index.html          # 主页面结构
├── styles.css          # 样式文件
├── js/                 # JavaScript 目录
│   ├── script.js       # 交互逻辑
│   └── blog-posts.js   # 博客文章配置
├── projects/           # 项目配置目录
│   └── projects.js     # 项目配置
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
