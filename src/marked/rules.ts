import { ExtTokenizer, Tokens } from "@/marked/MdLexer";
import { convertCss, getStyleAttrs } from "@/block/marks/Style";
import { convertEmoji } from "@/block/extensions/Emoji";
import katex from "katex";
import { ExtParser } from "@/marked/MdParser";

export const extTokenizers: ExtTokenizer[] = [
  {
    inline: true,
    matcher: src => /\$\$([^$\n]+?)\$\$/.exec(src),
    tokenizer: match => ({
      type: "tex",
      raw: match[0],
      text: match[1].trim()
    })
  },
  {
    inline: true,
    matcher: src => /\[\[([^\]]+)]]/.exec(src),
    tokenizer: match => {
      const split = match[1].split(/\|| "|"/);
      let title = null;
      if (split.length === 4) {
        title = split[2];
      } else if (split.length === 3) {
        title = split[1];
      }
      return {
        type: "card_link",
        raw: match[0],
        text: split.length === 4 || split.length === 2 ? split[1] : split[0],
        href: split[0],
        title
      };
    }
  },
  {
    inline: true,
    matcher: src => /\[([^\]]+)]{([^}]+)}/.exec(src),
    tokenizer: match => ({
      type: "style",
      raw: match[0],
      text: match[1],
      attrs: getStyleAttrs(match)
    })
  },
  {
    inline: true,
    matcher: src => /\^([^_]+)_/.exec(src),
    tokenizer: match => ({
      type: "sub",
      raw: match[0],
      text: match[1]
    })
  },
  {
    inline: true,
    matcher: src => /\^([^-]+)-/.exec(src),
    tokenizer: match => ({
      type: "sup",
      raw: match[0],
      text: match[1]
    })
  },
  {
    matcher: src => /\[(TOC|toc)([^\]]*)\]/.exec(src),
    tokenizer: match => ({
      type: "toc",
      raw: match[0],
      fold: match[2].endsWith(":fold")
    })
  },
  {
    matcher: src =>
      /(:::|;;;)[ \t]?det[ \t]?([^\n]*)\n([\s\S]*)\n(:::|;;;)/.exec(src),
    tokenizer: match => ({
      type: "details",
      raw: match[0],
      text: match[3],
      summary: match[2] || "详细信息"
    })
  },
  {
    matcher: src => /(:::|;;;)[ \t]?mer\n([\s\S]*)\n(:::|;;;)/.exec(src),
    tokenizer: match => ({
      type: "mermaid",
      raw: match[0],
      text: match[2]
    })
  },
  {
    inline: true,
    matcher: src => /(:[a-zA-Z0-9]+:)/.exec(src),
    tokenizer: match => ({
      type: "text",
      raw: match[0],
      text: convertEmoji(match[1])
    })
  }
];

export const extParsers: ExtParser[] = [
  {
    type: "tex",
    parser: token =>
      katex.renderToString((token as Tokens.Tex).text, {
        throwOnError: false
      })
  },
  {
    type: "card_link",
    parser: (t, parser) => {
      const token = t as Tokens.Link;
      return `<a href="${parser.manager.options.card_link.concatLink(
        token.href
      )}" ${token.title ? `title="${token.title}"` : ""}>${token.text}</a>`;
    }
  },
  {
    type: "style",
    parser: t => {
      const token = t as Tokens.Style;
      return `<span style="${convertCss(token.attrs)}">${token.text}</span>`;
    }
  },
  {
    type: "sub",
    parser: token => `<sub>${(token as Tokens.Sub).text}</sub>`
  },
  {
    type: "sup",
    parser: token => `<sup>${(token as Tokens.Sup).text}</sup>`
  },
  {
    type: "details",
    parser: t => {
      const token = t as Tokens.Details;
      return `<details><summary>${token.summary}</summary>${token.text}</details>`;
    }
  },
  {
    type: "mermaid",
    parser: token =>
      `<div class="mermaid">${(token as Tokens.Mermaid).text}</div>`
  }
];
