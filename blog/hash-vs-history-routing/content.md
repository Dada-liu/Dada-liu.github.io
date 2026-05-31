## 1、什么是前端路由

前端路由是在单页应用（SPA）中，通过改变 URL 来切换页面视图，而不向服务器发起完整页面请求的机制。主要有两种实现方式：**Hash 路由** 和 **History 路由**。



## 2、Hash 路由

### 原理

Hash 路由基于 URL 中的 `#` 片段标识符（fragment identifier）。

```
https://example.com/#/user/profile
```

`#` 及其后面的部分称为 hash，不会发送到服务器。浏览器通过 `hashchange` 事件监听 hash 的变化。

### 核心 API

```javascript
// 监听 hash 变化
window.addEventListener('hashchange', () => {
  const hash = window.location.hash; // "#/user/profile"
  renderRoute(hash);
});

// 手动改变 hash
window.location.hash = '/user/profile';
```

### 实现一个简易 HashRouter

```javascript
class HashRouter {
  constructor(routes) {
    this.routes = routes;
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const component = this.routes[hash];
    if (component) {
      document.getElementById('app').innerHTML = component();
    }
  }

  push(path) {
    window.location.hash = path;
  }
}
```

### 优点

- **兼容性好**：所有浏览器都支持，包括 IE8+
- **无需服务端配置**：hash 不会发送到服务器，服务端始终收到的是同一个 URL
- **部署简单**：直接放静态文件服务器即可，不会有 404 问题

### 缺点

- **URL 不美观**：URL 中带有 `#`，不够优雅
- **SEO 不友好**：搜索引擎通常不索引 hash 部分的内容
- **锚点冲突**：与页面内的 `<a href="#anchor">` 锚点功能冲突



## 3、History 路由

### 原理

History 路由基于 HTML5 的 History API（`pushState` 和 `replaceState`），可以改变 URL 路径而不发起请求。

```
https://example.com/user/profile
```

通过 `popstate` 事件监听浏览器前进/后退，但 `pushState` 和 `replaceState` 不会触发 `popstate`。

### 核心 API

```javascript
// 添加一条历史记录，不会触发页面请求
history.pushState(state, title, '/user/profile');

// 替换当前历史记录
history.replaceState(state, title, '/user/profile');

// 监听浏览器前进 / 后退
window.addEventListener('popstate', (e) => {
  console.log(e.state); // pushState/replaceState 传入的 state
});
```

### 实现一个简易 BrowserRouter

```javascript
class BrowserRouter {
  constructor(routes) {
    this.routes = routes;
    window.addEventListener('popstate', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());

    // 拦截所有内部链接点击，使用 pushState 而非页面跳转
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-router-link]');
      if (link) {
        e.preventDefault();
        this.push(link.getAttribute('href'));
      }
    });
  }

  handleRoute() {
    const path = window.location.pathname;
    const component = this.routes[path];
    if (component) {
      document.getElementById('app').innerHTML = component();
    }
  }

  push(path) {
    history.pushState(null, '', path);
    this.handleRoute();
  }

  replace(path) {
    history.replaceState(null, '', path);
    this.handleRoute();
  }
}
```

### 优点

- **URL 美观**：没有 `#`，看起来像正常的服务器路由
- **SEO 友好**：搜索引擎可以正常抓取每个路径
- **更灵活**：可以传递更复杂的 state 对象

### 缺点

- **需要服务端配置**：刷新页面或直接访问路径时，服务端如果没有对应资源会返回 404
- **兼容性稍差**：需要 IE10+（History API 支持）



## 4、服务端配置差异

### Hash 路由

无需任何服务端配置，所有请求指向同一个 HTML 文件即可。

### History 路由

需要服务端将所有路径转发到 `index.html`：

**Nginx 配置：**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache 配置（.htaccess）：**

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**开发服务器（webpack-dev-server / vite）：**

```javascript
// vite.config.js
export default {
  server: {
    historyApiFallback: true
  }
}
```



## 5、对比总结

| 特性 | Hash 路由 | History 路由 |
|------|----------|-------------|
| URL 外观 | `/#/user` 带 `#` | `/user` 干净 |
| 实现方式 | `hashchange` 事件 | History API |
| 浏览器兼容 | IE8+ | IE10+ |
| SEO | 差 | 好 |
| 服务端配置 | 不需要 | 需要 fallback 配置 |
| 页面刷新 | 无问题 | 需配置，否则 404 |
| 锚点功能 | 有冲突 | 无冲突 |
| state 传递 | 仅字符串 | 可传复杂对象 |



## 6、主流框架中的使用

### React Router v6

```javascript
// Hash 路由
import { HashRouter } from 'react-router-dom';

<HashRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</HashRouter>

// History 路由
import { BrowserRouter } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</BrowserRouter>
```

### Vue Router

```javascript
// Hash 路由（默认）
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...]
});

// History 路由
const router = createRouter({
  history: createWebHistory(),
  routes: [...]
});
```



## 7、如何选择

- **后台管理系统、内部工具**：推荐 Hash 路由，部署简单，无需关心服务端配置
- **面向用户的产品、需要 SEO**：推荐 History 路由，配合 SSR/SSG 获得更好的搜索引擎收录
- **静态站点部署在 GitHub Pages、CDN**：优先 Hash 路由，避免 404 问题
- **已有服务端或使用 Node.js 中间层**：推荐 History 路由，做好 fallback 配置即可
