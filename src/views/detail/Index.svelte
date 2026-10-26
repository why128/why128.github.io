<script lang="ts">
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import { onMount } from "svelte";
    import { formatTime } from "$lib/util";
    import Diago from "@/component/diago.svelte";

    // 获取url id
    let loading = true;
    export let params: { [key: string]: string };

    // TS 接口
    interface Post {
        id: number;
        title: string;
        summary: string;
        content: string;
        link: string;
        readtimes?: number;
        updatedAt: string;
    }

    // === 临时硬编码详情数据（服务器修复后可删除）===
    let post: Post | null = null;
    //新请求服务器
    async function getData(id: number) {
        loading = true;
        try {
            const response = await fetch(`https://a.aws.wattley.top/home/api/v1/articles/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            post = {
                id: result.id,
                title: result.title,
                summary: result.summary || result.content.slice(0, 100) + "...",
                content: result.content,
                link: result.link,
                readtimes: result.readtimes,
                updatedAt: formatTime(result.updatedAt),
            };
        } catch (error) {
            console.error("请求失败 (Error)", error);
        } finally {
            loading = false;
        }
    }
    // === 原 Supabase 请求逻辑（已注释，服务器恢复后取消注释即可）===
    /*
    import supabase from "$lib/supabase";

    async function getData(id: number) {
        const { data, error } = await supabase
            .from("githubio_list")
            .select("id,title,date,excerpt,content,link,readTime")
            .eq("id", id)
            .get();
        if (error) {
            console.error("查询失败 (Error)", error);
            return null;
        }
        post = data[0];
        //增加浏览记录的值
        const currentReadTime = post?.readTime || 0;
        const newReadTime = currentReadTime + 1;
        const { data: dataup, error: errorup } = await supabase
            .from("githubio_list")
            .eq("id", id)
            .update({ readTime: newReadTime }, { returning: "minimal" });
        if (errorup) {
        } else {
        }
        loading = false;
    }
    */

    onMount(() => {
        // 查询当前的博客日志（暂时使用硬编码）
        getData(Number(params.id));
        loading = false;
    });

    function goback() {
        window.location.hash = "#/";
    }
</script>

<Diago diago={loading} />
<Header />
<div class="main">
    <div class="container">
        {#if post}
            <h2>
                {post?.title}
                <button class="btn btn-primary" type="button" on:click={goback}
                    >返回</button
                >
            </h2>
            <div class="sub-title">
                <p class="date">发布时间: {formatTime(post?.updatedAt)}</p>
                <p class="readtime">查阅次数: {Number(post?.readtimes) + 1}</p>
            </div>
            <div class="content-html">{@html post?.content.replaceAll(/\\n/g, '<br>')}</div>
        {/if}
    </div>
</div>
<Footer />

<style>
    /* 原有样式保持不变 */
    .btn {
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        border: 1px solid #ccc;
        background-color: #fff;
        cursor: pointer;
        display: block;
        float: right;
    }
    .btn-primary {
        background-color: #007bff;
        color: #fff;
    }
    .sub-title {
        display: flex;
    }
    .sub-title .date {
        font-size: 14px;
        color: #666;
    }
    .sub-title .readtime {
        font-size: 14px;
        color: #666;
        margin-left: 50px;
    }
    .content-html {
        font-size: 18px;
        color: #971701;
        word-wrap: break-word;
        white-space: pre-wrap;
    }
    .content-html :global(*) {
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    .content-html :global(img){
        display: block;
        margin: 20px 0;
        max-width: 100%;
        height: auto;
    }
</style>
