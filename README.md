# XK-Editor (Tiptap)

> **本项目基于 [tiptap](https://github.com/ueberdosis/tiptap) 开发而来，由于存在更好的方案 [xkeditor-next](https://github.com/syfxlin/xkeditor-next), 所以本项目将不再开发。**
>
> 更换的原因其实就是 tiptap 在大文本处理上性能不佳，另外加上 Vue2 配合 TypeScript 开发相对不完善，比如大量的 Vue 组件都不是用 TypeScript 写的或者没有类型声明文件，在开发中需要使用大量的适配方案，如 `// @ts-ignore` 或者 `any` 等。

![Author](https://img.shields.io/badge/Author-Otstar%20Lin-blue.svg?style=flat-square) ![License](https://img.shields.io/github/license/syfxlin/xkeditor.svg?style=flat-square)

## 简介 Introduction

`XK-Editor (Tiptap)` = `TypeScript` + `Vue2.0` + `Ace` + `TipTap`;

基于 TipTap 和 Ace 编辑器重新开发的编辑器，拥有接近 Typora 的编辑方式，同时保留了分栏编辑的方式。

语法转换流程：

- Markdown => Node：Markdown => Marked Token => Node
- Node => Markdown：Node => Markdown
- Markdown => HTML：Markdown => Marked Token => HTML

重写了 Marked 的 Lexer 和 Parser，使其支持模块化。Marked Token 通过自定义的转换器直接转换成 Node，避免多次转换导致的性能损失。

在 TipTap 的基础上完善 InputRules 和 PasteRules，支持 Markdown 语法编辑和 Markdown 内容的粘贴。同时增加了 Markdown 的生成器和解析器。

## 文档 Doc

暂无

## 维护者 Maintainer

XK-Editor 由 [Otstar Lin](https://ixk.me/) 和下列 [贡献者](https://github.com/syfxlin/xkeditor-tiptap/graphs/contributors) 的帮助下撰写和维护。

> Otstar Lin - [Personal Website](https://ixk.me/) · [Blog](https://blog.ixk.me/) · [Github](https://github.com/syfxlin)

## 许可证 License

![License](https://img.shields.io/github/license/syfxlin/xkeditor-tiptap.svg?style=flat-square)

根据 Apache License 2.0 许可证开源。
