import Index from "@/views/index/Index.svelte";
import About from "@/views/about/Index.svelte";
import Error404 from "@/views/error404/Index.svelte";
import Detail from "@/views/detail/Index.svelte";
import Subscribe from "@/views/subscribe/Index.svelte";
import EightCharacters from "@/views/eightcharacters/Index.svelte";
import Gossip from "@/views/gossip/Index.svelte";
const routes: object = {
    "/": Index,
    "/about": About,
    "/gossip": Gossip,
    "/detail/:id": Detail,
    "/subscribe": Subscribe,
    "/eightcharacters": EightCharacters,
    // 支持动态路由：'/user/:id': User
    "*": Error404, // 默认路由（404 回首页）
};

export default routes