# 前端性能优化

前端性能优化是提升用户体验的关键环节。本文将系统性地介绍前端性能优化的各个方面。

## 1、加载性能优化

### 减少 HTTP 请求

- 合并 CSS/JavaScript 文件
- 使用 CSS Sprite 合并图片
- 使用内联小图片（Base64）

### 启用压缩

- 服务端启用 Gzip 或 Brotli 压缩
- 压缩 HTML、CSS、JavaScript 文件
- 配置压缩级别平衡体积和 CPU 开销

### 使用 CDN

- 将静态资源部署到 CDN
- CDN 可以就近访问，减少延迟
- 减轻源站压力

### 缓存策略

- 设置合理的 Cache-Control 头
- 使用版本号或哈希命名文件
- 实现离线缓存（Service Worker）

## 2、渲染性能优化

### 减少重排和重绘

```javascript
// 避免频繁修改 DOM 样式
// 错误示例
element.style.width = '100px';
element.style.height = '100px';
element.style.color = 'red';

// 正确做法：使用 CSS 类
element.classList.add('active');
```

### 使用 CSS transform 和 opacity

- transform 和 opacity 不会触发重排
- 使用 will-change 提示浏览器优化
- 启用 GPU 加速

### 虚拟列表

- 只渲染可视区域内的元素
- 处理大数据列表时尤为重要
- 常用库：react-virtualized、vue-virtual-scroller

## 3、JavaScript 性能优化

### 减少主线程阻塞

- 将耗时任务拆分成小任务
- 使用 requestIdleCallback 空闲执行
- Web Worker 处理计算密集型任务

### 事件委托

```javascript
// 事件委托示例
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    // 处理点击
  }
});
```

### 防抖和节流

```javascript
// 防抖：等待停止后执行
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流：固定频率执行
function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

## 4、资源加载优化

### 延迟加载

- 图片延迟加载：使用 loading="lazy"
- 路由懒加载：动态 import
- 组件懒加载

```javascript
// 路由懒加载
const Home = () => import('./Home.vue');
const About = () => import('./About.vue');
```

### 预加载和预获取

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="critical.js">

<!-- 预获取后续资源 -->
<link rel="prefetch" href="next-page.js">
```

### 关键 CSS 内联

- 提取首屏关键 CSS
- 内联到 HTML 中
- 异步加载非关键 CSS

## 5、图片优化

### 格式选择

- 照片：WebP > JPEG
- 图标：SVG > PNG
- 动画：WebP 动图 / GIF

### 响应式图片

```html
<img srcset="img-320w.jpg 320w,
             img-640w.jpg 640w,
             img-1024w.jpg 1024w"
     sizes="(max-width: 480px) 100vw, 50vw"
     src="img-640w.jpg"
     alt="响应式图片">
```

### 图片压缩

- 使用 WebP 格式
- 适当降低图片质量
- 使用工具：tinypng、sharp

## 6、代码优化

### Tree Shaking

- 移除未使用的代码
- 使用 ES Modules
- 配置打包工具的 tree shaking

### 代码分割

- 按路由分割
- 按组件分割
- 提取公共代码

### 压缩和混淆

- 使用 Terser 压缩 JavaScript
- 使用 cssnano 压缩 CSS
- 启用源码映射（生产环境可选）

## 7、监测与工具

### 性能监测

- Chrome DevTools Performance 面板
- Lighthouse 性能审计
- Web Vitals 核心指标

### 核心指标

- LCP (Largest Contentful Paint)：最大内容绘制
- FID (First Input Delay)：首次输入延迟
- CLS (Cumulative Layout Shift)：累积布局偏移

### 常用工具

- PageSpeed Insights
- WebPageTest
- Chrome Lighthouse

## 8、总结

前端性能优化是一个系统工程，需要从多个维度综合考虑：

1. 加载阶段：减少请求、启用压缩、合理缓存
2. 渲染阶段：减少重排重绘、优化 JS 执行
3. 资源阶段：懒加载、预加载、图片优化
4. 持续监测：定期审计、及时发现性能问题

性能优化不是一次性的工作，而是需要持续关注和改进的过程。
