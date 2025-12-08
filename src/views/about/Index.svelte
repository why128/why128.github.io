<script>
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
</script>

<Header />
<div class="main">
    <div class="container">
        <div class="item avatar">
            <p>头像：</p>
            <img
                src="https://image.wattley.top/file/AgACAgUAAyEGAATPGd8VAAPAaTAhW3MoHwz_siovOi_lVpDsWlYAAkoMaxvSYoBVywkOTEoeGvQBAAMCAAN4AAM2BA.jpg"
                alt=""
            />
        </div>
        <div class="item avatar">
            <p>博客：</p>
            <p>https://why128.github.io</p>
        </div>
        <div class="item avatar">
            <p>地址：</p>
            <p>北京市朝阳区</p>
        </div>
        <div class="item avatar">
            <p>合作：</p>
            <p>+1 571 530 2930 (USA)</p>
        </div>
        <div class="item tg">
            <p>TG：</p>
            <a target="_blank" href="https://t.me/githubio_why128"
                >@githubio_why128</a
            >
        </div>
    </div>
</div>
<Footer />

<style>
    .item {
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }
    .item p {
        font-size: 20px;
        color: #333;
        margin-right: 50px;
    }
    .tg a {
        font-size: 20px;
        color: #007bff;
    }
    .avatar img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
    }
</style>
