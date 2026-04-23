// 项目数据配置
export const projects = [
    {                                                                                       
      id: 'resume-generator',                                                           
      title: '简历编辑器',                                                                
      description: '使用 React 19、TypeScript 和 Tailwind CSS 构建的在线简历编辑工具，支持实时预览、PDF 导出和数据持久化。',                          
      image: './projects/assets/websit-preview.png',
      tech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Zustand', 'jspdf',                
  'react-hook-form', 'Zod'], 
      demoUrl: 'https://dada-liu.github.io/resume-generator/',
      githubUrl: 'https://github.com/dada-liu/resume-generator-2'
    },
    {
        "id": "quant-fe-components",
        "title": "量化前端组件库",
        "description": "面向量化交易场景的 React 组件库，提供金融数据可视化、交易操作、风控管理等 27 个核心组件，包含K线图、成交量图、订单面板、持仓管理、风控看板等，支持主题切换和按需加载",
        "image": "https://picsum.photos/seed/project3/400/200.jpg",
        "tech": [
        "React 18",
        "TypeScript",
        "Vite 8",
        "ECharts 5",
        "pnpm workspaces",
        "Storybook 8",
        "SCSS",
        "Vitest",
        "ESLint",
        "GitHub Actions"
        ],
        "demoUrl": "",
        "githubUrl": "https://github.com/Dada-liu/quant-fe-components"
    },
    {
        id: 'weather-dashboard',
        title: '天气仪表盘',
        description: '一款响应式天气仪表盘，提供基于位置的天气预报、交互式地图和历史天气数据可视化。',
        image: 'https://picsum.photos/seed/project3/400/200.jpg',
        tech: ['JavaScript', 'API集成', 'Chart.js'],
        demoUrl: '#',
        githubUrl: '#'
    }
];
