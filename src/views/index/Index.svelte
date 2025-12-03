<script lang="ts">
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import supabase from "$lib/supabase";

    // TS 接口：文章类型
    interface Post {
        title: string;
        date: string;
        excerpt: string;
        content: string;
        link: string; // 文章链接
        readTime?: number; // 可选：阅读时间
    }
    // 查询示例
    let posts: Post[] = [];
    (async () => {
        const { data, error } = await supabase
            .from("githubio_list")
            .order("id", { ascending: false })
            .range(0, 9) // offset + limit 自动计算
            .select("*"); // 自动发起请求
        console.log(data);
        if (error) {
            console.error("查询失败 (Error)", error);

            // 关键：检查 status 字段
            if (error.status === 401) {
                console.warn(
                    "错误类型: 401 Unauthorized - 认证失败，请检查 FRONTEND_TOKEN 或 DUMMY_KEY",
                );
            } else if (error.status === 404) {
                console.warn(
                    `错误类型: 404 Not Found - 表 githubio_list 可能不存在`,
                );
            } else {
                console.warn(`错误类型: 其他错误 Status ${error.status}`);
            }
            return null;
        }
        posts = data;
    })();

    // 分页示例（当前页、总页）
    let currentPage = 1;
    let totalPages = 5;

    // 简单分页函数（占位）
    function goToPage(page: number) {
        currentPage = page;
        // 加载新 posts...
    }
</script>

<Header />
<main class="main">
    <div class="container">
        <div class="posts">
            {#each posts as post}
                <article class="post-item">
                    <h2 class="post-title">
                        <a href={post.link}>{post.title}</a>
                    </h2>
                    <div class="post-meta">
                        <span class="date">{post.date}</span>
                        <span class="read-time">· {post.readTime} 分钟阅读</span
                        >
                    </div>
                    <p class="post-excerpt">{post.excerpt}</p>
                    <a href={post.link} class="read-more">阅读全文 →</a>
                </article>
            {/each}
        </div>

        <!-- 分页 -->
        {#if totalPages > 1}
            <nav class="pagination">
                <ul>
                    {#if currentPage > 1}
                        <li>
                            <a
                                href="#"
                                on:click|preventDefault={() =>
                                    goToPage(currentPage - 1)}>上一页</a
                            >
                        </li>
                    {/if}
                    {#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
                        <li class:active={page === currentPage}>
                            <a
                                href="#"
                                on:click|preventDefault={() => goToPage(page)}
                                >{page}</a
                            >
                        </li>
                    {/each}
                    {#if currentPage < totalPages}
                        <li>
                            <a
                                href="#"
                                on:click|preventDefault={() =>
                                    goToPage(currentPage + 1)}>下一页</a
                            >
                        </li>
                    {/if}
                </ul>
            </nav>
        {/if}
    </div>
</main>
<Footer />

<style>
    /* 主体：文章列表 */
    .main {
        min-height: calc(100vh - 200px); /* 占满剩余高度 */
        padding: 40px 0;
    }
    .posts {
        display: flex;
        flex-direction: column;
        gap: 30px;
    }
    .post-item {
        background: #fff;
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
    }
    .read-more {
        font-size: 14px;
        color: #007acc;
        text-decoration: none;
    }
    .read-more:hover {
        text-decoration: underline;
    }

    /* 分页：简单按钮 */
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
    .pagination li {
        display: inline-block;
    }
    .pagination a {
        display: block;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        text-decoration: none;
        color: #333;
        transition: background 0.3s;
    }
    .pagination a:hover {
        background: #f5f5f5;
    }
    .pagination .active a {
        background: #007acc;
        color: #fff;
        border-color: #007acc;
    }
    @media (max-width: 768px) {
        .pagination ul {
            flex-wrap: wrap;
            gap: 5px;
        }
    }
</style>
