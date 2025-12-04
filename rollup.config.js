import svelte from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import deleteAsync from 'rollup-plugin-delete';
import html2 from 'rollup-plugin-html2';
import pkg from './package.json' with { type: 'json' };
import postcss from 'rollup-plugin-postcss';
import alias from '@rollup/plugin-alias';
import url from '@rollup/plugin-url'; // 🚀 导入插件

export default {
    input: 'src/main.ts',
    output: {
        sourcemap: true,
        dir: 'dist',
        entryFileNames: `bundle-v${pkg.version}-[hash].js`,
        format: 'iife',
        name: 'app'
    },
    plugins: [
        alias({
            entries: [
                { find: '@', replacement: 'src' },
                { find: '$lib', replacement: 'src/lib' },
                { find: '$common', replacement: 'src/common' }
            ]
        }),
        url({
            // 匹配您需要处理的资源文件扩展名
            include: [
                '**/*.gif',
                '**/*.jpg',
                '**/*.png',
                '**/*.svg',
                '**/*.webp'
            ],
            // 可选：设置文件大小限制（以字节为单位）。
            // 小于限制的文件会被转换为 Base64 data URL 嵌入到 JS 中。
            // 大于限制的文件会被复制到输出目录，并返回 URL 路径。
            limit: 10 * 1024, // 10KB 限制

            // 可选：指定输出目录（如果文件大于 limit）
            // 默认情况下会输出到与 JS 文件相同的目录
            // publicPath: 'build/', 
            // dest: 'public/build'
        }),
        deleteAsync({ targets: ['dist/*'] }),
        svelte({
            compilerOptions: {
                dev: false
            },
            preprocess: preprocess(),
            emitCss: false
        }),
        postcss({
            extract: false,
            minimize: true,
            config: { path: './postcss.config.js' }
        }),
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: true,
            inlineSources: true
        }),
        resolve({
            browser: true,
            dedupe: ['svelte'],
            extensions: ['.mjs', '.js', '.json', '.node', '.ts']
        }),
        commonjs(),
        terser({
            compress: true,
            mangle: true
        }),
        html2({
            template: `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="referrer" content="unsafe-url">
            <meta name="viewport" content="initial-scale=1,minimum-scale=1,width=device-width,interactive-widget=resizes-content">
            <title>博客空间why128</title>
            </head>
            <body><div id="app"></div></body>
            </html>`,
            fileName: 'index.html',
            inject: true,
            entries: { 'main': { defer: true } }
        })
    ],
    watch: {
        clearScreen: false
    }
};