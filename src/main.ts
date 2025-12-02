import App from './App.svelte';
import type { SvelteComponent } from 'svelte';  // TS 类型

const app: SvelteComponent = new App({
    target: document.getElementById('app') as HTMLElement  // 类型断言
});

export default app;