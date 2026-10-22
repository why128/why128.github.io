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
        summary: string;
        content: string;
        link: string;
        readtimes?: number;
        updatedAt: string;
    }

    // 显示是否加载中
    let loading = false;
    
    // === 临时硬编码数据（服务器修复后可删除）===
    let posts: Post[] = [
        
    ];

    let currentPage = 1;
    let pageSize = 2;
    let totalPages = 1;
    // 新请求服务器
    async function getData(page: number, pageSize: number) {
        loading = true;
        try {
            const response = await fetch(`https://a.aws.wattley.top/home/api/v1/articles?page=${page}&pageSize=${pageSize}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            posts = result.list.map((v: Post) => ({
                id: v.id,
                title: v.title,
                summary: v.summary || v.content.slice(0, 100) + "...",
                link: v.link,
                readtimes: v.readtimes,
                updatedAt: formatTime(v.updatedAt),
            }));
            totalPages = Math.ceil(result.total / pageSize);
        } catch (error) {
            console.error("请求失败 (Error)", error);
        } finally {
            loading = false;
        }
    }


    // 简单分页函数（当前使用硬编码数据，暂不生效）
    function goToPage(page: number) {
        currentPage = page;
        getData(currentPage, pageSize);  // 注释状态下不调用
    }

    onMount(() => {
        getData(currentPage, pageSize);  // 暂时不执行网络请求
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
                        <a href={`#/detail/${post.id}`} use:link>
                            {post.title}
                        </a>
                    </h2>
                    <div class="post-meta">
                        <span class="date">{post.updatedAt}</span>
                        <span class="read-time">· {post.readtimes} 次阅读</span>
                    </div>
                    <p class="post-excerpt">{post.summary}</p>
                    <a
                        href={`#/detail/${post.id}`}
                        use:link
                        class="read-more">阅读全文 →</a>
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