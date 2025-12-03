<script lang="ts">
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import supabase from "$lib/supabase";
    import { onMount } from "svelte";
    import { formatTime } from "$lib/util";
    // 获取url id
    export let params: { [key: string]: string };
    interface Post {
        id: number;
        title: string;
        date: string;
        excerpt: string;
        content: string;
        link: string; // 文章链接
        readTime?: number; // 可选：阅读时间
    }
    let post: Post | null = null;
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
    }
    onMount(() => {
        getData(Number(params.id));
    });
    function goback() {
        window.location.hash = "#/";
    }
</script>

<Header />
<div class="main">
    <div class="container">
        <h1>
            博客详情 <button
                class="btn btn-primary"
                type="button"
                on:click={goback}>返回</button
            >
        </h1>
        {#if post}
            <h2>{post?.title}</h2>
            <p>{formatTime(post?.date)}</p>
            <div>{post?.content}</div>
            <p>{post?.readTime}</p>
        {/if}
    </div>
</div>
<Footer />

<style>
    /* 脚注：简单居中 */
    .btn {
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        border: 1px solid #ccc;
        border-color: none;
        background-color: #fff;
        cursor: pointer;
        display: block;
        float: right;
    }
    .btn-primary {
        background-color: #007bff;
        color: #fff;
    }
</style>
