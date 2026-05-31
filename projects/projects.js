// 项目数据配置
export const projects = [
    {
        id: 'qmt-live-assistant',
        title: 'QMT Live Assistant',
        description: '基于 Python FastAPI + 原生 HTML 前端的 miniQMT 量化交易助手，支持多策略管理、远程信号接收、实时行情刷新、Token 认证、亮暗主题切换，设计风格参考 Coinbase。',
        image: 'https://picsum.photos/seed/qmt-live/400/200.jpg',
        tech: ['Python', 'FastAPI', 'uvicorn', 'xtquant', 'HTML/CSS', 'JavaScript ES Module'],
        demoUrl: '',
        githubUrl: 'https://github.com/Dada-liu/QMT-Live-Assistant'
    },
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
    }
];
