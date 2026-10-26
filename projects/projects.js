// 项目数据配置
export const projects = [
    {
        "id": "hotpot-agent",
        "title": "HotPot Agent",
        "description": "基于 Node + TypeScript 的 code agent，pnpm monorepo 实现 main / worker / task 三层编排与分层模型路由，支持 plan 审批、三档权限与 steer/queue 双队列，会话以 JSONL 日志为唯一事实源，提供 CLI 和 React Web 端。",
        "image": "./projects/assets/hotpot-agent-preview.webp",
        "tech": [
        "Node.js",
        "TypeScript",
        "pnpm Monorepo",
        "React 18",
        "Vite 6",
        "Tailwind CSS 4",
        "Hono",
        "REST + SSE",
        "Vitest"
        ],
        "demoUrl": "https://dada-liu.github.io/hotpot-agent/",
        "githubUrl": "https://github.com/Dada-liu/hotpot-agent"
    },
    {
        id: 'deepseek-work',
        title: 'DeepSeek Work',
        description: '基于 Tauri v2 的 DeepSeek 桌面 Agent，作为 DSH 官方 Web UI 的桌面壳。安装包完全自包含 Node.js 运行时与 @deepseek-ai/dsh 依赖树，无需预装任何环境，支持 macOS / Windows，托盘驻留，通过 GitHub Releases 分发。',
        image: './projects/assets/ds-work-preview.webp',
        tech: ['Tauri v2', 'Rust', 'React 18', 'TypeScript', 'Vite 7', '@deepseek-ai/dsh'],
        demoUrl: 'https://www.hotpotliuyu.com/ds-work/',
        githubUrl: 'https://github.com/Dada-liu/deepseek-work-preview'
    },
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
      image: './projects/assets/websit-preview.webp',
      tech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Zustand', 'jspdf',                
  'react-hook-form', 'Zod'], 
      demoUrl: 'https://dada-liu.github.io/resume-generator/',
      githubUrl: 'https://github.com/dada-liu/resume-generator-2'
    }
];
