<script lang="ts">
    import { link } from "svelte-spa-router"; // 修复：导入 action（非组件）
</script>

<!-- HTML 结构：头部 + 主体 + 脚注 -->
<header class="header">
    <div class="container">
        <a href="/" class="logo">博·客 - Why128</a>
        <nav class="nav">
            <ul>
                <li><a href="/">首页</a></li>
                <li><a href="/about" use:link>关于</a></li>
                <li><a href="/eightcharacters" use:link>八字</a></li>
                <li><a href="/subscribe" use:link>订阅</a></li>
            </ul>
        </nav>
    </div>
</header>

<style>
    /* 头部：固定导航 */
    .header {
        background: rgba(255, 255, 255, 0.3);
        border-bottom: 1px solid #eee;
        position: sticky;
        top: 0;
        z-index: 10;
        padding: 15px 0;
    }
    .header .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .logo {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        text-decoration: none;
    }
    .nav ul {
        list-style: none;
        display: flex;
        gap: 30px;
        margin: 0;
        padding: 0;
    }
    .nav a {
        text-decoration: none;
        color: #333;
        font-size: 16px;
        transition: color 0.3s ease;
    }
    .nav a:hover {
        color: #007acc;
    }
    @media (max-width: 768px) {
        .header .container {
            flex-direction: column;
            gap: 10px;
        }
        .nav ul {
            gap: 20px;
            flex-wrap: wrap;
            justify-content: center;
        }
    }
</style>
