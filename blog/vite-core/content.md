Vite 是新一代前端构建工具，它采用了现代化的开发理念，为开发者提供了极速的开发体验。

## 1、为什么选择 Vite

传统的构建工具如 Webpack 在开发模式下需要将所有模块打包成 bundle，这个过程随着项目规模增长会变得非常缓慢。Vite 利用浏览器原生 ES 模块的特性，开发时无需打包，直接提供服务。

## 2、极速的冷启动

Vite 通过预构建依赖（使用 esbuild）来实现极快的冷启动。esbuild 是用 Go 编写的打包工具，比传统的 JavaScript 打包工具快 10-100 倍。

- 依赖预构建：Vite 会自动将 node_modules 中的依赖转换为 ES 模块
- 按需加载：只有实际使用的模块才会被加载

## 3、模块热更新（HMR）

Vite 利用 ESM 实现高效的模块热更新：

- 精准更新：只更新变化的模块，不需要刷新整个页面
- 保持状态：HMR 过程中页面的应用状态不会丢失
- 构建速度快：基于源码的 HMR 比 bundle 方式快很多

## 4、构建优化

### 内联依赖

Vite 会将常用的依赖内联到主模块中，减少 HTTP 请求数量。

### 代码分割

Vite 使用 Rollup 进行生产构建，支持自动代码分割：

- 动态导入：使用 `import()` 实现路由级代码分割
- 手动分割：通过配置 manualChunks 自定义分割策略

## 5、插件系统

Vite 通过插件机制扩展功能，与 Rollup 兼容的插件可以直接在 Vite 中使用：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

### 常用插件

- @vitejs/plugin-vue - Vue 支持
- @vitejs/plugin-react - React 支持
- vite-plugin-pages - 页面路由自动生成
- vite-plugin-components - 组件自动导入

## 6、配置与优化

### 环境变量

Vite 通过 `.env` 文件支持环境变量：

```
.env              # 默认
.env.local        # 本地覆盖
.env.production   # 生产环境
.env.development  # 开发环境
```

### 构建选项

```javascript
export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true
  }
})
```

## 7、与其他工具对比

| 特性 | Vite | Webpack | Parcel |
|------|------|---------|--------|
| 冷启动 | 极快 | 慢 | 快 |
| HMR | 极速 | 一般 | 快 |
| 配置复杂度 | 低 | 高 | 低 |
| 生态 | 快速增长 | 成熟 | 一般 |

## 8、vite8 新特性

1. 统一 Rolldown 引擎：dev/build 一套代码，速度提升 10–30 倍；
2. 内置 Devtools：浏览器里直接看 Vite 性能、依赖图、HMR 日志；
3. 原生 tsconfig paths：无需插件，直接启用别名解析；
4. emitDecoratorMetadata：内置支持 TS 装饰器元数据（NestJS 友好）；
5. Wasm SSR 支持：.wasm?init 可在服务端运行；
6. 浏览器日志转发：server.forwardConsole 把浏览器 log 打到终端。
