import { blogPosts } from './blog-posts.js';
import { projects } from '../projects/projects.js';
import { experiences } from './experience.js';
import { micromark } from 'https://esm.sh/micromark@4.0.2';
import { gfm, gfmHtml } from 'https://esm.sh/micromark-extension-gfm@3.0.0';

// 加载经历时间线
function loadExperience() {
    const timeline = document.getElementById('experienceTimeline');
    if (!timeline) return;

    timeline.innerHTML = experiences.map(exp => `
        <div class="timeline-item">
            <div class="timeline-date">${exp.period}</div>
            <div class="timeline-content">
                <h3>${exp.title}</h3>
                <p class="company">${exp.company}</p>
                ${exp.description.map(desc => `<p>${desc}</p>`).join('')}
            </div>
        </div>
    `).join('');
}

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
                    <a href="${project.demoUrl}" class="project-link" target="_blank">在线演示</a>
                    <a href="${project.githubUrl}" class="project-link" target="_blank">GitHub</a>
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
            window.location.hash = '#blog/' + postId;
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

        // 初始化代码块展开/收起
        initCodeBlockToggle();

        // 初始化目录滚动监听
        initTocScrollSpy(toc);

        // 初始化目录按钮
        initTocButtons();
    } catch (error) {
        console.error('加载博客文章出错:', error);
        blogArticle.innerHTML = getPlaceholderContent(post);
    }
}

// 使用 micromark 解析 Markdown
function parseMarkdown(markdown) {
    // 1. 解析为 HTML（GFM + 原始 HTML 支持）
    let html = micromark(markdown, {
        allowDangerousHtml: true,
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()]
    });

    // 2. 后处理：为标题添加 id 和 class（用于目录跳转）
    let headingIndex = 0;
    html = html.replace(
        /<h([1-6])>(.*?)<\/h\1>/gi,
        (match, level, text) => {
            const id = `heading-${headingIndex++}`;
            return `<h${level} id="${id}" class="article-heading">${text}</h${level}>`;
        }
    );

    // 3. 后处理：链接新窗口打开
    html = html.replace(
        /<a\b([^>]*)>/gi,
        (match, attrs) => {
            if (/target\s*=/i.test(attrs)) return match;
            return `<a${attrs} target="_blank" style="color: #3b86ef;">`;
        }
    );

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
            <div class="toc-header">
                <button class="toc-btn toc-toggle-btn" title="展开/收起目录" aria-label="展开或收起目录">
                    <span class="toc-toggle-text">目录</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button class="toc-btn toc-scroll-top-btn" title="滚动到顶部" aria-label="滚动到页面顶部">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="4"/><polyline points="6 10 12 4 18 10"/></svg>
                </button>
            </div>
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

// 初始化目录按钮（展开/收起 + 滚动到顶部）
function initTocButtons() {
    const toggleBtn = document.querySelector('.toc-toggle-btn');
    const scrollTopBtn = document.querySelector('.toc-scroll-top-btn');
    const tocList = document.querySelector('.toc-list');

    // 展开/收起目录
    if (toggleBtn && tocList) {
        const tocHeader = document.querySelector('.toc-header');

        toggleBtn.addEventListener('click', () => {
            const isCollapsed = tocList.style.display === 'none';
            tocList.style.display = isCollapsed ? '' : 'none';
            if (tocHeader) tocHeader.classList.toggle('toc-collapsed', !isCollapsed);
            toggleBtn.classList.toggle('collapsed', !isCollapsed);
        });
    }

    // 滚动到顶部
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// 初始化代码块展开/收起功能
function initCodeBlockToggle() {
    const preElements = document.querySelectorAll('.blog-article-content pre');

    preElements.forEach(pre => {
        const lines = pre.textContent.split('\n').filter(line => line.trim() !== '').length;

        if (lines === 0 || lines <= 10) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        pre.classList.add('code-block-collapsed');

        const button = document.createElement('button');
        button.className = 'code-block-toggle';
        button.textContent = '展开';
        wrapper.insertBefore(button, wrapper.firstChild);

        button.addEventListener('click', () => {
            const isCollapsed = pre.classList.toggle('code-block-collapsed');

            if (isCollapsed) {
                button.textContent = '展开';
                pre.style.maxHeight = '';
            } else {
                button.textContent = '收起';
                pre.style.maxHeight = pre.scrollHeight + 'px';

                const onTransitionEnd = () => {
                    pre.style.maxHeight = '';
                    pre.removeEventListener('transitionend', onTransitionEnd);
                };
                pre.addEventListener('transitionend', onTransitionEnd);
            }
        });
    });
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

// 路由处理 — 统一导航入口
function handleRoute() {
    const hash = window.location.hash.substring(1);

    if (!hash || hash === 'about') {
        switchSection('about');
    } else if (hash === 'skills' || hash === 'projects' || hash === 'blog') {
        switchSection(hash);
    } else if (hash.startsWith('blog/')) {
        const postId = hash.substring(5);
        switchSection('blog-detail');
        showBlogDetail(postId);
    }
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
    loadExperience();

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

    // 关于我页面 Tab 切换
    const aboutTabs = document.querySelectorAll('.about-tab');
    const aboutTabContents = document.querySelectorAll('.about-tab-content');

    aboutTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.aboutTab;
            const targetContentId = targetTab === 'about-me' ? 'about-me' : `about-${targetTab}`;

            aboutTabs.forEach(t => t.classList.remove('active'));
            aboutTabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(targetContentId).classList.add('active');
        });
    });

    // 返回按钮事件
    const backToBlogBtn = document.getElementById('backToBlog');
    if (backToBlogBtn) {
        backToBlogBtn.addEventListener('click', () => {
            window.location.hash = '#blog';
        });
    }

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = this.getAttribute('href');
        });
    });

    // 路由处理
    window.addEventListener('hashchange', handleRoute);
    handleRoute();

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