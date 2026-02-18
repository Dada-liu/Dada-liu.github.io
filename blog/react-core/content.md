# React 核心：深入理解组件化思想

React 是目前最流行的前端框架之一，它的核心理念是**组件化**。本文将深入探讨 React 的核心概念。

## 1. 组件（Component）

组件是 React 的基本构建单元，每个组件都是一个独立的、可复用的 UI 片段。

### 函数组件

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

### 类组件

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

## 2. JSX

JSX 是 JavaScript 的语法扩展，允许在 JS 中编写类似 HTML 的代码：

```jsx
const element = <h1>Hello, world!</h1>;
```

### JSX 特点

- **编译转换**: JSX 会被 Babel 转换为 `React.createElement()` 调用
- **表达式嵌入**: 使用 `{}` 可以嵌入任何 JS 表达式
- **属性命名**: 使用驼峰命名（如 `className` 代替 `class`）

## 3. Props（属性）

Props 是组件间传递数据的方式：

```jsx
function UserCard({ name, avatar, role }) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
}

// 使用
<UserCard name="Alice" avatar="/avatar.jpg" role="Developer" />
```

## 4. State（状态）

State 是组件内部管理的可变数据：

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

## 5. 生命周期

React 组件有三个主要生命周期阶段：

1. **挂载（Mounting）**: 组件被创建并插入 DOM
2. **更新（Updating）**: 组件被重新渲染
3. **卸载（Unmounting）**: 组件从 DOM 中移除

### useEffect Hook

```jsx
useEffect(() => {
  // 挂载后执行
  document.title = `Count: ${count}`;

  // 清理函数（卸载前执行）
  return () => {
    document.title = 'App';
  };
}, [count]); // 依赖数组
```

## 6. 虚拟 DOM

React 使用虚拟 DOM 来提高渲染性能：

1. React 在内存中维护一个 DOM 副本
2. 当状态变化时，创建新的虚拟 DOM 树
3. 通过 Diff 算法比较新旧树，找出最小变化
4. 只更新必要的真实 DOM 节点

## 7. 单向数据流

React 遵循单向数据流原则：

- 数据从父组件流向子组件
- 子组件不能直接修改父组件的数据
- 通过回调函数实现子到父的通信

## 最佳实践

1. **保持组件纯净**: 相同输入总是产生相同输出
2. **单一职责**: 每个组件只做一件事
3. **组合优于继承**: 使用组合来复用代码
4. **合理拆分**: 不要过度拆分，也不要让组件过于庞大

## 总结

React 的核心思想是将 UI 拆分为独立的、可复用的组件。通过理解组件、Props、State、生命周期等核心概念，你可以构建出复杂而高效的应用。

---

**相关资源**:

- [React 官方文档](https://react.dev/)
- [React Hooks 指南](https://react.dev/reference/react)
