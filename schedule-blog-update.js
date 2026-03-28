#!/usr/bin/env node

/**
 * 定时博客更新脚本
 *
 * 功能：
 * 1. 在每天的12:00-13:00或20:00-23:00随机时间，向 blog/ts-core/content.md 添加一行随机内容
 * 2. 在每天的23:00执行git提交并推送到远程仓库
 *
 * 使用方法：
 * 1. 安装依赖：npm install node-cron
 * 2. 运行脚本：node schedule-blog-update.js
 *
 * 或者使用系统的cron调度：
 * 1. 给脚本添加执行权限：chmod +x schedule-blog-update.js
 * 2. 编辑crontab：crontab -e
 * 3. 添加以下行：
 *    # 每天12点和20点各运行一次，随机延迟0-60分钟
 *    0 12,20 * * * sleep $((RANDOM \% 3600)) && cd /path/to/project && node schedule-blog-update.js add-random-line
 *    # 每天23点提交并推送
 *    0 23 * * * cd /path/to/project && node schedule-blog-update.js git-push
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置文件路径
const BLOG_FILE = path.join(__dirname, 'blog/ts-core/content.md');

// 随机内容池 - 关于TypeScript的句子
const RANDOM_CONTENTS = [
    'TypeScript的类型系统可以帮助我们在编译时捕获错误。',
    '接口（Interface）是TypeScript的核心概念之一，用于定义对象的形状。',
    '泛型（Generics）允许我们创建可重用的组件，同时保持类型安全。',
    '类型别名（Type Aliases）可以用来给类型起一个新名字。',
    '联合类型（Union Types）表示一个值可以是几种类型之一。',
    '交叉类型（Intersection Types）可以将多个类型合并为一个类型。',
    '类型守卫（Type Guards）允许我们在运行时检查类型。',
    '枚举（Enums）为一组数值赋予更友好的名字。',
    '类型断言（Type Assertions）允许我们手动指定值的类型。',
    '装饰器（Decorators）是一种特殊类型的声明，可以附加到类、方法、属性或参数上。',
    '命名空间（Namespaces）用于组织代码，避免命名冲突。',
    '模块（Modules）可以帮助我们组织代码，并支持代码的复用。',
    '类型推断（Type Inference）让TypeScript能够自动推断变量的类型。',
    '只读属性（Readonly Properties）确保某些属性只能在创建时被赋值。',
    '可选属性（Optional Properties）允许我们定义一些可选的属性。',
    '函数重载（Function Overloads）允许一个函数接受不同数量或类型的参数。',
    '条件类型（Conditional Types）允许我们根据条件选择不同的类型。',
    '映射类型（Mapped Types）允许我们基于旧类型创建新类型。',
    '索引类型（Index Types）允许我们通过索引获取类型。',
    '工具类型（Utility Types）是TypeScript内置的一些常用类型转换工具。'
];

/**
 * 获取随机内容
 */
function getRandomContent() {
    const randomIndex = Math.floor(Math.random() * RANDOM_CONTENTS.length);
    return RANDOM_CONTENTS[randomIndex];
}

/**
 * 向博客文件添加随机内容
 */
function addRandomLineToBlog() {
    try {
        // 读取文件内容
        const content = fs.readFileSync(BLOG_FILE, 'utf8');

        // 获取随机内容
        const randomLine = getRandomContent();

        // 在文件末尾添加新行（如果最后一行不是空行，先添加一个空行）
        let newContent = content;
        if (!newContent.endsWith('\n')) {
            newContent += '\n';
        }
        newContent += randomLine + '\n';

        // 写回文件
        fs.writeFileSync(BLOG_FILE, newContent, 'utf8');

        console.log(`[${new Date().toLocaleString()}] 已添加随机内容: "${randomLine}"`);
        return true;
    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] 添加随机内容失败:`, error.message);
        return false;
    }
}

/**
 * 执行git操作：添加、提交、推送
 */
function gitPush() {
    try {
        // 检查是否有变更
        const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();

        if (!status) {
            console.log(`[${new Date().toLocaleString()}] 没有变更需要提交`);
            return true;
        }

        console.log(`[${new Date().toLocaleString()}] 检测到变更:\n${status}`);

        // 添加所有变更
        execSync('git add .', { stdio: 'inherit' });

        // 生成提交消息
        const commitMessage = `docs: 自动更新博客内容 - ${new Date().toLocaleString()}`;

        // 提交
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

        // 推送到远程
        execSync('git push', { stdio: 'inherit' });

        console.log(`[${new Date().toLocaleString()}] 已成功提交并推送到远程仓库`);
        return true;
    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] git操作失败:`, error.message);
        return false;
    }
}

/**
 * 主函数
 */
function main() {
    const command = process.argv[2];

    switch (command) {
        case 'add-random-line':
            addRandomLineToBlog();
            break;
        case 'git-push':
            gitPush();
            break;
        case 'run-schedule':
            // 使用node-cron运行定时任务
            runSchedule();
            break;
        default:
            console.log('使用方法:');
            console.log('  node schedule-blog-update.js add-random-line  # 添加随机内容');
            console.log('  node schedule-blog-update.js git-push         # 提交并推送变更');
            console.log('  node schedule-blog-update.js run-schedule    # 运行定时调度（需要node-cron）');
            console.log('');
            console.log('或者使用系统的cron调度：');
            console.log('  1. 每天12点和20点运行: node schedule-blog-update.js add-random-line');
            console.log('  2. 每天23点运行: node schedule-blog-update.js git-push');
            break;
    }
}

/**
 * 使用node-cron运行定时调度（可选）
 */
function runSchedule() {
    try {
        const cron = require('node-cron');

        // 每天12:00-13:00随机时间添加内容
        cron.schedule('0 12 * * *', () => {
            // 随机延迟0-60分钟
            const delay = Math.floor(Math.random() * 60 * 60 * 1000);
            setTimeout(() => {
                addRandomLineToBlog();
            }, delay);
        });

        // 每天20:00-23:00随机时间添加内容
        cron.schedule('0 20 * * *', () => {
            // 随机延迟0-180分钟
            const delay = Math.floor(Math.random() * 180 * 60 * 1000);
            setTimeout(() => {
                addRandomLineToBlog();
            }, delay);
        });

        // 每天23:00执行git推送
        cron.schedule('0 23 * * *', () => {
            gitPush();
        });

        console.log('定时调度已启动，按Ctrl+C退出');
        console.log('• 每天12:00-13:00随机时间添加内容');
        console.log('• 每天20:00-23:00随机时间添加内容');
        console.log('• 每天23:00提交并推送');

        // 保持进程运行
        process.stdin.resume();
    } catch (error) {
        console.error('启动定时调度失败，请确保已安装node-cron: npm install node-cron');
        console.error('错误信息:', error.message);
    }
}

// 执行主函数
if (require.main === module) {
    main();
}