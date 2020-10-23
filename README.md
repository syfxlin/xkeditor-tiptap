# XK-Editor (Next)

> 一个支持富文本和 Markdown 的编辑器

> **本项目目前还处于早期开发阶段，最近挺忙的，可能会咕很久。**

![Author](https://img.shields.io/badge/Author-Otstar%20Lin-blue.svg?style=flat-square) ![License](https://img.shields.io/github/license/syfxlin/xkeditor.svg?style=flat-square)

## 简介 Introduction

`XK-Editor (Next)` = `TypeScript` + `Vue2.0` + `Ace` + `TipTap`;

基于 TipTap 和 Ace 编辑器重新开发的编辑器，拥有接近 Typora 的编辑方式，同时保留了分栏编辑的方式。

语法转换流程：

- Markdown => Node：Markdown => Marked Token => Node
- Node => Markdown：Node => Markdown
- Markdown => HTML：Markdown => Marked Token => HTML

重写了 Marked 的 Lexer 和 Parser，使其支持模块化。Marked Token 通过自定义的转换器直接转换成 Node，避免多次转换导致的性能损失。

## 文档 Doc

暂无

## 维护者 Maintainer

XK-Editor 由 [Otstar Lin](https://ixk.me/) 和下列 [贡献者](https://github.com/syfxlin/xkeditor-next/graphs/contributors) 的帮助下撰写和维护。

> Otstar Lin - [Personal Website](https://ixk.me/) · [Blog](https://blog.ixk.me/) · [Github](https://github.com/syfxlin)

## 许可证 License

![License](https://img.shields.io/github/license/syfxlin/xkeditor-next.svg?style=flat-square)

根据 Apache License 2.0 许可证开源。
