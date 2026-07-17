<script lang="ts">
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import { onMount } from "svelte";
    import { link } from "svelte-spa-router";
    import { formatTime } from "$lib/util";
    import Diago from "@/component/diago.svelte";

    // TS 接口：文章类型
    interface Post {
        id: number;
        title: string;
        date: string;
        excerpt: string;
        content: string;
        link: string;
        readTime?: number;
    }

    // 显示是否加载中
    let loading = false;
    
    // === 临时硬编码数据（服务器修复后可删除）===
    let posts: Post[] = [
        {
            id: 1,
            title: "欢迎来到我的博客空间",
            date: formatTime(new Date().toISOString()),
            excerpt: "这里记录我的思考、学习笔记和生活点滴。感谢你的到来！",
            content: "你好！我是 why128，很高兴你能来到这里。\n\n这个博客是我用 Svelte + Supabase 搭建的个人空间，未来会持续分享技术文章、日常随笔和一些有趣的项目。\n\n如果你有任何想法或建议，欢迎随时留言交流～\n\n祝你阅读愉快！",
            link: "/detail",
            readTime: 5
        }
    ];

    let currentPage = 1;
    let size = 2;
    let totalPages = 1;

    // === 原 Supabase 请求逻辑（已注释，服务器恢复后取消注释即可）===
    /*
    import supabase from "$lib/supabase";

    async function getData(page: number, size: number) {
        loading = true;
        const { data, error } = await supabase
            .from("githubio_list")
            .order("id", { ascending: false })
            .range((page - 1) * size, page * size - 1)
            .select("id,title,date,excerpt,content,link,readTime")
            .get();

        if (error) {
            console.error("查询失败 (Error)", error);
            if (error.status === 401) {
                console.warn("错误类型: 401 Unauthorized - 认证失败");
            } else if (error.status === 404) {
                console.warn("错误类型: 404 Not Found - 表不存在");
            }
            return null;
        }

        posts = data.map((v: Post) => ({
            id: v.id,
            title: v.title,
            date: formatTime(v.date),
            excerpt: v.excerpt,
            content: v.content,
            link: v.link,
            readTime: v.readTime,
        }));
        loading = false;
    }

    (async () => {
        const { data: totalData, error: totalError } = await supabase
            .from("githubio_list")
            .select("id")
            .get({ count: "exact" });
        if (totalError) return;
        totalPages = Math.ceil(totalData.length / size);
    })();
    */

    // 简单分页函数（当前使用硬编码数据，暂不生效）
    function goToPage(page: number) {
        currentPage = page;
        // getData(currentPage, size);  // 注释状态下不调用
    }

    onMount(() => {
        // getData(currentPage, size);  // 暂时不执行网络请求
        loading = false;
    });
</script>

<Diago diago={loading} />
<Header />
<main class="main">
    <div class="container">
        <div class="posts">
            {#each posts as post}
                <article class="post-item">
                    <h2 class="post-title">
                        <a href={`${post.link}/${post.id}`} use:link>
                            {post.title}
                        </a>
                    </h2>
                    <div class="post-meta">
                        <span class="date">{post.date}</span>
                        <span class="read-time">· {post.readTime} 次阅读</span>
                    </div>
                    <p class="post-excerpt">{post.excerpt}</p>
                    <a
                        href={`${post.link}/${post.id}`}
                        use:link
                        class="read-more">阅读全文 →</a>
                </article>
            {/each}
        </div>

        <!-- 分页（当前只有一条数据，暂不显示） -->
        {#if totalPages > 1}
            <nav class="pagination">
                <!-- 分页代码保持原样 -->
            </nav>
        {/if}
    </div>
</main>
<Footer />

<style>
    /* 原有样式保持不变 */
    .posts {
        display: flex;
        flex-direction: column;
        gap: 30px;
    }
    .post-item {
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 25px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: box-shadow 0.3s ease;
    }
    .post-item:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .post-title {
        margin: 0 0 10px 0;
        font-size: 20px;
    }
    .post-title a {
        color: #222;
        text-decoration: none;
    }
    .post-title a:hover {
        color: #007acc;
    }
    .post-meta {
        font-size: 14px;
        color: #999;
        margin-bottom: 15px;
    }
    .post-excerpt {
        margin: 0 0 15px 0;
        color: #666;
        white-space: pre-line;
    }
    .read-more {
        font-size: 14px;
        color: #007acc;
        text-decoration: none;
    }
    .read-more:hover {
        text-decoration: underline;
    }

    .pagination {
        margin-top: 40px;
        text-align: center;
    }
    .pagination ul {
        list-style: none;
        display: flex;
        justify-content: center;
        gap: 10px;
        margin: 0;
        padding: 0;
    }
    .pagination a {
        display: block;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        text-decoration: none;
        color: #333;
    }
</style>