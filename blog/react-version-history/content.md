## 1、React 15

1. 完善组件生命周期

   - 挂载、更新、卸载
   - hooks写法：useEffect 整合 挂载、更新、卸载

2. 强化虚拟 DOM 与 diff 算法性能，减少不必要重渲染

   - 虚拟 DOM：用一个轻量级 JS 对象，模拟庞大的真实 DOM对象

   - diff算法：

     - 从数据到真实DOM渲染：生成新的虚拟DOM树，和旧的虚拟DOM树做对比，找出最小差异，然后吧差异部分更新到真实DOM

     - React diff算法：将 O (n³) → O(n)，只对比同层级节点、对比type、对比key

       



## 2、React 16

1. Fiber架构重构
   - 传统Diff是同步执行的，一旦节点多，回阻塞浏览器渲染
   - Fiber架构：
     - 每个节点具有指向父节点、子节点、右边第一个兄弟节点的指针
     - 可中断、可恢复、可优先级调度
     - 优先执行用户交互
     - 空闲时再执行Diff
     
2. 错误边界
3. protals
4. fragment
5. context
6. React hooks



## 3、React 17

进一步优化



## 4、React 18

1. 并发渲染、新根API：createRoot
2. 自动批处理：默认将 Promise、setTimeout、fetch 等场景的回调函数内的多个setState合并（之前只有React流程内的）
3. transition api
4. 自动 hydration
5. server components



### 5、React 19

1. React Forget：是 React 官方推出的**构建时静态编译器**，核心目标是**自动做记忆化优化**
2. Actions api
3. Asset Loading
4. SEO优化：Document Metadata

