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
                { find: '$lib', replacement: 'src/lib' }
            ]
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
            <title>Svelte App</title>
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