# 关于项目介绍
🐱‍🚀 项目分为两个分支 master、gh-pages

## 分支介绍
* 🐱‍🚀 master: 该分支是每个账号自用，用来发布 网站博客 <yourname>.github.io ，这个无法改变，按照github.io的使用规则

* 🐱‍🚀 gh-pages： 该分支是开发分支，也是项目主要分支，用来开发博客推送代码自动化构建，接下来着重介绍该分支的项目

### 博客项目

---
* 🐱‍🚀.github/workflows
+ 🐱‍🚀目录下是自动化构建的脚本yml文件，具体可分析其功能，主要流程：
- 1. 开发人员push代码到仓库，仓库会执行打包流程生成 dist/* 目录文件
- 2. 脚本把dist/* 目录下的文件 copy && push 到 master 分支
- 3. 推送前 清空master 分支下所有文件，避免原始文件或上版本遗留文件对新版本造成干扰
- 4. master分支接到push后会调用github.io自己原始的构建工具，发布push的dist/*下的代码，实现项目发布更新

---
* 🐱‍🚀项目采用 Svelte + rollup技术，自行搭建的脚手架，利用fetch请求数据
+ 