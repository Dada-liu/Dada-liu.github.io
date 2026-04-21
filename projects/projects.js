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
        id: 'task-management',
        title: '任务管理应用',
        description: '一款支持实时更新、拖拽功能和团队协作的协作式任务管理应用。',
        image: 'https://picsum.photos/seed/project2/400/200.jpg',
        tech: ['Vue.js', 'Express', 'Socket.io'],
        demoUrl: '#',
        githubUrl: '#'
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
