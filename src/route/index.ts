import Index from "@/views/index/Index.svelte";
import About from "@/views/about/Index.svelte";
import Error404 from "@/views/error404/Index.svelte";


const routes = {
    "/": Index,
    "/about": About,
    // 支持动态路由：'/user/:id': User
    "*": Error404, // 默认路由（404 回首页）
};

export default routes