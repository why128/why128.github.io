import svelte from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import deleteAsync from 'rollup-plugin-delete';  // 清理 dist
import html2 from 'rollup-plugin-html2';  // 使用 html2
import pkg from './package.json' with { type: 'json' };  // 版本读取
import postcss from 'rollup-plugin-postcss';  // 新增：处理 CSS 导入   
import alias from '@rollup/plugin-alias';  // 新增：路径别名插件

export default {
    input: 'src/main.ts',  // TS 入口：打包 JS
    output: {
        sourcemap: true,
        dir: 'dist',
        entryFileNames: `bundle-v${pkg.version}-[hash].js`,  // 版本 + hash（插件自动使用）
        format: 'iife',
        name: 'app'
    },
    plugins: [
        alias({  // 新增：配置 @ 别名为 src/ 根目录
            entries: [
                { find: '@', replacement: 'src/' }  // @/xxx 解析为 src/xxx
            ]
        }),
        deleteAsync({ targets: ['dist/*'] }),  // 清理 dist
        svelte({
            compilerOptions: {
                dev: false
            },
            preprocess: preprocess(),
            emitCss: false
        }),
        postcss({  // 修复：移除 use，让 postcss.config.js 处理
            extract: false,  // 内联 CSS 到 JS
            minimize: true,  // 压缩（cssnano 在 config 中添加）
            config: { path: './postcss.config.js' }  // 显式 PostCSS 配置
        }),
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: true,
            inlineSources: true
        }),
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
        commonjs(),
        terser({
            compress: true,
            mangle: true
        }),
        // html2({
        //     template: './index.html',  // 文件路径（字符串，必填）
        //     inject: true,  // 默认 true，启用注入
        //     fileName: 'index.html',  // 可选（默认为 template basename）
        //     entries: {  // 可选：自定义注入属性
        //         'main': {  // chunk 名从 Rollup 日志确认（通常 'main' 对于 src/main.ts）
        //             tag: 'script',  // 明确为 script（可选）
        //             attrs: { defer: true }  // 添加 defer 属性
        //         }
        //     },
        //     minify: { collapseWhitespace: true }  // 可选：压缩 HTML
        // })
        html2({
            template: `<!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><meta name="referrer" content="unsafe-url"><title>Svelte App</title></head>
            <body><div id="app"></div></body>
            </html>`,
            fileName: 'index.html',  // 必填，用于内联字符串
            inject: true,
            entries: { 'main': { defer: true } }
        })
    ],
    watch: {
        clearScreen: false
    }
};