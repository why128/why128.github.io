<script lang="ts">
    import "@/common/css/public.css";
    import Router from "svelte-spa-router"; // 默认导出
    // import { Link } from "svelte-spa-router"; // 命名导出
    import routes from "@/route/index";
    import "@/common/js/RibbonsEffect.js";
</script>

<Router {routes} />

<style></style>
