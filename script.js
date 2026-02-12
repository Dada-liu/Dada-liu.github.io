// 博客文章配置
const blogPosts = [
    {
        id: 'new-article',
        title: 'CSS选择器优先级、层叠、继承',
        excerpt: '深入理解 CSS 的核心概念：选择器优先级、层叠规则和继承机制。',
        date: '2024-02-12',
        tag: '技术',
        image: 'https://picsum.photos/seed/new-article/600/320.jpg',
        content: 'blog/new-article/content.md'
    },
    {
        id: 'everything-claude-code',
        title: 'Everything Claude Code',
        excerpt: 'Claude Code 完全指南 - 探索 Anthropic 官方 CLI 工具的强大功能。',
        date: '2024-02-09',
        tag: 'Claude',
        image: 'https://picsum.photos/seed/claude-code/600/320.jpg',
        content: 'blog/everything-claude-code/content.md'
    }
];

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
                    <span class="blog-card-tag">${post.tag}</span>
                </div>
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <span class="blog-card-read-more">Read More →</span>
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
    blogArticle.innerHTML = '<div style="text-align: center; padding: 40px;">Loading...</div>';

    try {
        // 尝试从 Markdown 文件加载内容
        const response = await fetch(post.content);
        let content = '';

        if (response.ok) {
            const markdown = await response.text();
            content = parseMarkdown(markdown);
        } else {
            // 如果无法加载，使用默认内容
            content = getPlaceholderContent(post);
        }

        blogArticle.innerHTML = `
            <header class="blog-article-header">
                <h1 class="blog-article-title">${post.title}</h1>
                <div class="blog-article-meta">
                    <span class="blog-article-date">📅 ${formatDate(post.date)}</span>
                    <span class="blog-article-tag">🏷️ ${post.tag}</span>
                </div>
            </header>
            ${post.image ? `<div class="blog-article-hero"><img src="${post.image}" alt="${post.title}"></div>` : ''}
            <div class="blog-article-content">
                ${content}
            </div>
        `;

        // 切换到详情页
        switchSection('blog-detail');
    } catch (error) {
        console.error('Error loading blog post:', error);
        blogArticle.innerHTML = getPlaceholderContent(post);
    }
}

// 简单的 Markdown 解析器
function parseMarkdown(markdown) {
    let html = markdown;

    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 标题
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

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
    const navLinks = document.querySelectorAll('.nav-link');

    contentSections.forEach(section => {
        section.classList.remove('active');
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const activeLink = document.querySelector(`[href="#${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');

    // 加载博客列表
    loadBlogList();

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