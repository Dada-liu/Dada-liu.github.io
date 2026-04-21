import { blogPosts } from './blog-posts.js';
import { projects } from './projects.js';

// 加载项目列表
function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech">
                    ${project.tech.map(t => `<span>${t}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${project.demoUrl}" class="project-link">在线演示</a>
                    <a href="${project.githubUrl}" class="project-link">GitHub</a>
                </div>
            </div>
        </div>
    `).join('');
}

// 加载博客列表
function loadBlogList() {
    const blogList = document.getElementById('blogList');
    if (!blogList) return;

    blogList.innerHTML = blogPosts.map(post => `
        <article class="blog-card" data-post-id="${post.id}">
            <div class="blog-card-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-date">📅 ${formatDate(post.date)}</span>
                    <span class="blog-card-tags">${post.tags.map(tag => `<span class="blog-card-tag">${tag}</span>`).join('')}</span>
                </div>
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <span class="blog-card-read-more">阅读更多 →</span>
            </div>
        </article>
    `).join('');

    // 添加点击事件
    blogList.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', () => {
            const postId = card.dataset.postId;
            showBlogDetail(postId);
        });
    });
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('zh-CN', options);
}

// 显示博客详情
async function showBlogDetail(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    const blogArticle = document.getElementById('blogArticle');

    // 显示加载状态
    blogArticle.innerHTML = '<div style="text-align: center; padding: 40px;">加载中...</div>';

    try {
        // 尝试从 Markdown 文件加载内容
        const response = await fetch(post.content);
        let content = '';

        if (response.ok) {
            const markdown = await response.text();
            content = parseMarkdown(markdown);
            content = fixImagePaths(content, post.id);
        } else {
            // 如果无法加载，使用默认内容
            content = getPlaceholderContent(post);
        }

        // 提取目录
        const toc = extractTableOfContents(content);
        const tocHtml = generateTocHtml(toc);

        blogArticle.innerHTML = `
            ${post.image ? `<div class="blog-article-hero"><img src="${post.image}" alt="${post.title}"></div>` : ''}
            <header class="blog-article-header">
                <h1 class="blog-article-title">${post.title}</h1>
                <div class="blog-article-meta">
                    <span class="blog-article-date">📅 ${formatDate(post.date)}</span>
                    <span class="blog-article-tags">${post.tags.map(tag => `<span class="blog-article-tag">${tag}</span>`).join('')}</span>
                </div>
            </header>
            <div class="blog-article-body">
                <div class="blog-article-content">
                    ${content}
                </div>
                ${tocHtml ? `<aside class="blog-article-sidebar">${tocHtml}</aside>` : ''}
            </div>
        `;

        // 切换到详情页
        switchSection('blog-detail');

        // 初始化目录滚动监听
        initTocScrollSpy(toc);
    } catch (error) {
        console.error('加载博客文章出错:', error);
        blogArticle.innerHTML = getPlaceholderContent(post);
    }
}

// 简单的 Markdown 解析器
function parseMarkdown(markdown) {
    let html = markdown;

    // 代码块 - 先处理，避免代码块内的内容被其他规则影响
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 标题 - 使用占位符保护代码块，确保不匹配代码块内的标题
    const codePlaceholder = '___CODE_BLOCK_PLACEHOLDER___';
    const codeBlocks = [];
    html = html.replace(/<pre><code>[\s\S]*?<\/code><\/pre>/g, (match) => {
        codeBlocks.push(match);
        return `${codePlaceholder}${codeBlocks.length - 1}${codePlaceholder}`;
    });

    // 标题处理 - 为每个标题添加唯一 id 用于目录跳转
    let headingIndex = 0;
    html = html.replace(/^### (.+)$/gm, (match, text) => {
        const id = `heading-${headingIndex++}`;
        return `<h3 id="${id}" class="article-heading">${text}</h3>`;
    });
    html = html.replace(/^## (.+)$/gm, (match, text) => {
        const id = `heading-${headingIndex++}`;
        return `<h2 id="${id}" class="article-heading">${text}</h2>`;
    });
    html = html.replace(/^# (.+)$/gm, (match, text) => {
        const id = `heading-${headingIndex++}`;
        return `<h1 id="${id}" class="article-heading">${text}</h1>`;
    });

    // 恢复代码块
    codeBlocks.forEach((block, index) => {
        html = html.replace(`${codePlaceholder}${index}${codePlaceholder}`, block);
    });

    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #3b86ef;">$1</a>');

    // 粗体
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 斜体
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 引用
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // 无序列表
    html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)\n(?!<li>)/g, '$1</ul>\n');
    html = html.replace(/(?<!<\/ul>\n)(<li>)/g, '<ul>$1');

    // 段落
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // 清理空标签
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-3]>)/g, '$1');
    html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

    return html;
}

// 提取文章目录
function extractTableOfContents(html) {
    const toc = [];
    const regex = /<h([1-2])\s+id="(heading-\d+)"\s+class="article-heading">(.+?)<\/h\1>/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        toc.push({
            level: parseInt(match[1]),
            id: match[2],
            text: match[3]
        });
    }

    return toc;
}

// 生成目录 HTML
function generateTocHtml(toc) {
    if (toc.length === 0) return '';

    return `
        <nav class="article-toc">
            <h4 class="toc-title">目录</h4>
            <ul class="toc-list">
                ${toc.map(item => `
                    <li class="toc-item toc-level-${item.level}">
                        <a href="#${item.id}" class="toc-link">${item.text}</a>
                    </li>
                `).join('')}
            </ul>
        </nav>
    `;
}

// 目录滚动监听 - 高亮当前可见的标题
function initTocScrollSpy(toc) {
    if (toc.length === 0) return;

    const tocLinks = document.querySelectorAll('.toc-link');
    const headingIds = toc.map(item => item.id);

    // 点击目录链接，平滑滚动
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const offset = 80; // 考虑固定导航的偏移
                const top = targetElement.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // 滚动时更新高亮
    function updateActiveLink() {
        const scrollY = window.scrollY;
        let currentId = null;

        headingIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const offset = 100;
                if (element.offsetTop - offset <= scrollY) {
                    currentId = id;
                }
            }
        });

        tocLinks.forEach(link => {
            const linkId = link.getAttribute('href').substring(1);
            link.classList.toggle('active', linkId === currentId);
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // 初始化
}

// 修复图片路径 - 添加文章文件夹的相对路径
function fixImagePaths(html, articleId) {
    return html.replace(/<img src="([^"]+)"(?:\s+alt="([^"]*)")?/g, (match, src, alt) => {
        // 如果是绝对URL（http://, https://, //），不处理
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
            return match;
        }
        // 相对路径添加文章文件夹前缀
        const newSrc = `./blog/${articleId}/${src.replace(/^\.\//, '')}`;
        const altAttr = alt !== undefined ? ` alt="${alt}"` : '';
        return `<img src="${newSrc}"${altAttr}`;
    });
}

// 获取占位内容
function getPlaceholderContent(post) {
    return `
        <p>${post.excerpt}</p>
        <p>这是一篇关于 ${post.title} 的精彩文章。文章内容正在更新中，敬请期待...</p>
        <h2>文章要点</h2>
        <ul>
            <li>深入探讨核心概念</li>
            <li>实用的代码示例</li>
            <li>最佳实践建议</li>
            <li>常见问题解答</li>
        </ul>
        <p>感谢您的阅读！如果您有任何问题或建议，欢迎通过联系方式与我交流。</p>
    `;
}

// 切换 section
function switchSection(targetId) {
    const contentSections = document.querySelectorAll('.content-section');
    const desktopNavLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    contentSections.forEach(section => {
        section.classList.remove('active');
    });

    desktopNavLinks.forEach(link => {
        link.classList.remove('active');
    });
    mobileNavLinks.forEach(link => {
        link.classList.remove('active');
    });

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 桌面端导航
    const desktopActiveLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
    if (desktopActiveLink) {
        desktopActiveLink.classList.add('active');
    }

    // 移动端导航
    const mobileActiveLink = document.querySelector(`.mobile-nav-link[href="#${targetId}"]`);
    if (mobileActiveLink) {
        mobileActiveLink.classList.add('active');
    }

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    // 加载博客列表
    loadBlogList();
    loadProjects();

    // 侧边栏展开/收起
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebarToggle && sidebar) {
        // 默认展开状态
        let isExpanded = true;
        sidebarToggle.textContent = '✕';
        sidebarToggle.title = '收起侧边栏';

        sidebarToggle.addEventListener('click', () => {
            isExpanded = !isExpanded;
            sidebar.classList.toggle('collapsed', !isExpanded);
            sidebarToggle.textContent = isExpanded ? '✕' : '☰';
            sidebarToggle.title = isExpanded ? '收起侧边栏' : '展开侧边栏';
        });
    }

    // 返回按钮事件
    const backToBlogBtn = document.getElementById('backToBlog');
    if (backToBlogBtn) {
        backToBlogBtn.addEventListener('click', () => {
            switchSection('blog');
        });
    }

    function showSection(targetId) {
        switchSection(targetId);
    }

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Handle direct URL navigation (if someone lands on a specific section)
    const hash = window.location.hash.substring(1);
    if (hash) {
        showSection(hash);
    } else {
        // Show about section by default
        showSection('about');
    }

    // WeChat popup functionality
    const wechatLink = document.querySelector('.wechat-link');
    if (wechatLink) {
        wechatLink.addEventListener('click', function(e) {
            e.preventDefault();
            // The popup is handled by CSS hover, but we prevent default link behavior
        });
    }

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe project cards and timeline items for animations
    document.querySelectorAll('.project-card, .timeline-item, .contact-method').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
});