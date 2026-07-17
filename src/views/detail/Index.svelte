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
        date: string;
        excerpt: string;
        content: string;
        link: string;
        readTime?: number;
    }

    // === 临时硬编码详情数据（服务器修复后可删除）===
    let post: Post | null = {
        id: 1,
        title: "欢迎来到我的博客空间",
        date: new Date().toISOString(),
        excerpt: "这里记录我的思考、学习笔记和生活点滴。感谢你的到来！",
        content: `
            <p>你好！我是 why128，很高兴你能来到这里。</p>
            <p>这个博客是我用 Svelte + Supabase 搭建的个人空间，未来会持续分享技术文章、日常随笔和一些有趣的项目。</p>
            <p>如果你有任何想法或建议，欢迎随时留言交流～</p>
            <p>祝你阅读愉快！</p>
        `,
        link: "/detail",
        readTime: 5
    };

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
            console.error("递增 readtime 失败:", errorup);
        } else {
            console.log("readtime 递增请求已发送成功。");
        }
        loading = false;
    }
    */

    onMount(() => {
        // 查询当前的博客日志（暂时使用硬编码）
        // getData(Number(params.id));
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
                <p class="date">发布时间: {formatTime(post?.date)}</p>
                <p class="readtime">查阅次数: {Number(post?.readTime) + 1}</p>
            </div>
            <div class="content-html">{@html post?.content}</div>
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
</style>