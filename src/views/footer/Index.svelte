<script lang="ts">
    import { link } from "svelte-spa-router";
</script>

<footer class="footer">
    <div class="container">
        <p>
            &copy; 2025 MintYouth. Powered by Typecho. <a
                href="/subscribe"
                use:link>RSS</a
            >
            |
            <a target="_blank" href="https://github.com/why128">GitHub</a>
        </p>
    </div>
</footer>

<style>
    /* 脚注：简单居中 */
    .footer {
        background: rgba(248, 249, 250, 0.3);
        border-top: 1px solid #eee;
        padding: 20px 0;
        text-align: center;
        font-size: 14px;
        color: #999;
    }
    .footer a {
        color: #007acc;
        text-decoration: none;
    }
    .footer a:hover {
        text-decoration: underline;
    }
</style>
