<script>
    import supabase from "$lib/supabase";
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
</script>

<Header />
<div class="main">
    <div class="container">
        <div class="text">订阅关注TG账号</div>
    </div>
</div>
<Footer />

<style>
    .text {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        height: 300px;
    }
</style>
