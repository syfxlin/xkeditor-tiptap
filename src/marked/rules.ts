import { ExtTokenizer, Tokens } from "@/marked/MdLexer";
import { convertCss, getStyleAttrs } from "@/block/marks/Style";
import { convertEmoji } from "@/block/extensions/Emoji";
import katex from "katex";
import { ExtParser } from "@/marked/MdParser";
import {
  escape,
  findClosingBracket,
  indentCodeCompensation,
  mangle,
  outputLink,
  smartypants,
  splitCells
} from "@/marked/helpers";

export const extTokenizers: ExtTokenizer[] = [
  // Space
  {
    matcher: (src, { lexer }) => lexer.rules.block.newline.exec(src),
    tokenizer: match => {
      if (match[0].length > 1) {
        return {
          type: "space",
          raw: match[0]
        };
      }
      return {
        raw: "\n"
      };
    },
    pusher: token => (token.type ? token : null)
  },
  // Toc [TOC] [toc :fold]
  {
    matcher: src => /\[(TOC|toc)([^\]]*)\]/.exec(src),
    tokenizer: match => ({
      type: "toc",
      raw: match[0],
      fold: match[2].endsWith(":fold")
    })
  },
  // Details
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
  // Mermaid
  {
    matcher: src => /(:::|;;;)[ \t]?mer\n([\s\S]*)\n(:::|;;;)/.exec(src),
    tokenizer: match => ({
      type: "mermaid",
      raw: match[0],
      text: match[2]
    })
  },
  // Code
  {
    matcher: (src, { lexer }) => lexer.rules.block.fences.exec(src),
    tokenizer: match => {
      const raw = match[0];
      const text = indentCodeCompensation(raw, match[3] || "");
      return {
        type: "code",
        raw,
        lang: match[2] ? match[2].trim() : match[2],
        text
      };
    }
  },
  // Heading
  {
    matcher: (src, { lexer }) => lexer.rules.block.heading.exec(src),
    tokenizer: match => ({
      type: "heading",
      raw: match[0],
      depth: match[1].length,
      text: match[2]
    })
  },
  // NpTable
  {
    matcher: (src, { lexer }) => lexer.rules.block.nptable.exec(src),
    tokenizer: match => {
      const item: {
        type?: string;
        raw: string;
        [key: string]: any;
      } = {
        type: "table",
        header: splitCells(match[1].replace(/^ *| *\| *$/g, "")),
        align: match[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
        cells: match[3] ? match[3].replace(/\n$/, "").split("\n") : [],
        raw: match[0]
      };

      let l = item.align.length;
      let i;
      for (i = 0; i < l; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = "right";
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = "center";
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = "left";
        } else {
          item.align[i] = null;
        }
      }

      l = item.cells.length;
      for (i = 0; i < l; i++) {
        item.cells[i] = splitCells(item.cells[i], item.header.length);
      }

      return item;
    }
  },
  // Hr
  {
    matcher: (src, { lexer }) => lexer.rules.block.hr.exec(src),
    tokenizer: match => ({
      type: "hr",
      raw: match[0]
    })
  },
  // Blockquote
  {
    matcher: (src, { lexer }) => lexer.rules.block.blockquote.exec(src),
    tokenizer: match => ({
      type: "blockquote",
      raw: match[0],
      text: match[0].replace(/^ *> ?/gm, "")
    }),
    pusher: (token, { top, lexer }) => {
      token.tokens = lexer.blockTokens(token.text, [], top);
      return token;
    }
  },
  // List
  {
    matcher: (src, { lexer }) => lexer.rules.block.list.exec(src),
    tokenizer: (match, { lexer }) => {
      let raw = match[0];
      const bull = match[2];
      const isordered = bull.length > 1;
      const isparen = bull[bull.length - 1] === ")";

      const list: {
        type: string;
        raw: string;
        ordered: boolean;
        start: string | number;
        loose: boolean;
        items: any[];
      } = {
        type: "list",
        raw,
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };

      // Get each top-level item.
      const itemMatch = match[0].match(
        lexer.rules.block.item
      ) as RegExpMatchArray;

      let next = false,
        item,
        space,
        b,
        addBack,
        loose,
        istask,
        ischecked;

      const l = itemMatch.length;
      for (let i = 0; i < l; i++) {
        item = itemMatch[i];
        raw = item;

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+[.)]) */, "");

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf("\n ")) {
          space -= item.length;
          item = !lexer.options.pedantic
            ? item.replace(new RegExp("^ {1," + space + "}", "gm"), "")
            : item.replace(/^ {1,4}/gm, "");
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (i !== l - 1) {
          b = (lexer.rules.block.bullet.exec(
            itemMatch[i + 1]
          ) as RegExpMatchArray)[0];
          if (
            isordered
              ? b.length === 1 || (!isparen && b[b.length - 1] === ")")
              : b.length > 1 || (lexer.options.smartLists && b !== bull)
          ) {
            addBack = itemMatch.slice(i + 1).join("\n");
            list.raw = list.raw.substring(0, list.raw.length - addBack.length);
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === "\n";
          if (!loose) loose = next;
        }

        if (loose) {
          list.loose = true;
        }

        // Check for task list items
        istask = /^\[[ xX]\] /.test(item);
        ischecked = undefined;
        if (istask) {
          ischecked = item[1] !== " ";
          item = item.replace(/^\[[ xX]\] +/, "");
        }

        list.items.push({
          type: "list_item",
          raw,
          task: istask,
          checked: ischecked,
          loose: loose,
          text: item
        });
      }

      return list;
    },
    pusher: (token, { lexer }) => {
      const l = token.items.length;
      for (let i = 0; i < l; i++) {
        token.items[i].tokens = lexer.blockTokens(
          token.items[i].text,
          [],
          false
        );
      }
      return token;
    }
  },
  // HTML
  {
    matcher: (src, { lexer }) => lexer.rules.block.html.exec(src),
    tokenizer: (match, { lexer }) => ({
      type: lexer.options.sanitize ? "paragraph" : "html",
      raw: match[0],
      pre:
        !lexer.options.sanitizer &&
        (match[1] === "pre" || match[1] === "script" || match[1] === "style"),
      text: lexer.options.sanitize
        ? lexer.options.sanitizer
          ? lexer.options.sanitizer(match[0])
          : escape(match[0])
        : match[0]
    })
  },
  // Def
  {
    matcher: (src, { lexer }) => lexer.rules.block.def.exec(src),
    tokenizer: match => {
      if (match[3]) match[3] = match[3].substring(1, match[3].length - 1);
      const tag = match[1].toLowerCase().replace(/\s+/g, " ");
      return {
        tag,
        raw: match[0],
        href: match[2],
        title: match[3]
      };
    },
    pusher: (token, { lexer }) => {
      if (!lexer.tokens.links[token.tag]) {
        lexer.tokens.links[token.tag] = {
          href: token.href,
          title: token.title
        };
      }
      return null;
    }
  },
  // Table
  {
    matcher: (src, { lexer }) => lexer.rules.block.table.exec(src),
    tokenizer: match => {
      const item: {
        type?: string;
        raw: string;
        [key: string]: any;
      } = {
        type: "table",
        header: splitCells(match[1].replace(/^ *| *\| *$/g, "")),
        align: match[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
        cells: match[3] ? match[3].replace(/\n$/, "").split("\n") : [],
        raw: match[0]
      };

      let l = item.align.length;
      let i;
      for (i = 0; i < l; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = "right";
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = "center";
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = "left";
        } else {
          item.align[i] = null;
        }
      }

      l = item.cells.length;
      for (i = 0; i < l; i++) {
        item.cells[i] = splitCells(
          item.cells[i].replace(/^ *\| *| *\| *$/g, ""),
          item.header.length
        );
      }

      return item;
    }
  },
  // LHeading
  {
    matcher: (src, { lexer }) => lexer.rules.block.lheading.exec(src),
    tokenizer: match => ({
      type: "heading",
      raw: match[0],
      depth: match[2].charAt(0) === "=" ? 1 : 2,
      text: match[1]
    })
  },
  // Paragraph
  {
    matcher: (src, { lexer }) => lexer.rules.block.paragraph.exec(src),
    tokenizer: match => ({
      type: "paragraph",
      raw: match[0],
      text:
        match[1].charAt(match[1].length - 1) === "\n"
          ? match[1].slice(0, -1)
          : match[1]
    })
  },
  // Text
  {
    matcher: (src, { lexer }) => lexer.rules.block.exec(src),
    tokenizer: (match, { tokens }) => {
      const lastToken = tokens[tokens.length - 1];
      if (lastToken && lastToken.type === "text") {
        return {
          raw: match[0],
          text: match[0]
        };
      }

      return {
        type: "text",
        raw: match[0],
        text: match[0]
      };
    },
    pusher: (token, { tokens }) => {
      if (token.type) {
        return tokens;
      } else {
        const lastToken = tokens[tokens.length - 1];
        lastToken.raw += "\n" + token.raw;
        lastToken.text += "\n" + token.text;
        return null;
      }
    }
  },
  // Katex $$E=mc^2$$
  {
    inline: true,
    matcher: src => /\$\$([^$\n]+?)\$\$/.exec(src),
    tokenizer: match => ({
      type: "tex",
      raw: match[0],
      text: match[1].trim()
    })
  },
  // CardLink [[link]] [[link|desc "title"]]
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
  // Style [text]{blue} [text]{color:blue}
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
  // Sub ^2_
  {
    inline: true,
    matcher: src => /\^([^_]+)_/.exec(src),
    tokenizer: match => ({
      type: "sub",
      raw: match[0],
      text: match[1]
    })
  },
  // Sup ^2-
  {
    inline: true,
    matcher: src => /\^([^-]+)-/.exec(src),
    tokenizer: match => ({
      type: "sup",
      raw: match[0],
      text: match[1]
    })
  },
  // Emoji :emojiCode:
  {
    inline: true,
    matcher: src => /(:[a-zA-Z0-9]+:)/.exec(src),
    tokenizer: match => ({
      type: "text",
      raw: match[0],
      text: convertEmoji(match[1])
    })
  },
  // Escape
  {
    inline: true,
    matcher: (src, { lexer }) => lexer.rules.inline.escape.exec(src),
    tokenizer: match => ({
      type: "escape",
      raw: match[0],
      text: escape(match[1])
    })
  },
  // Tag
  {
    inline: true,
    matcher: (src, { lexer }) => lexer.rules.inline.tag.exec(src),
    tokenizer: (match, { inLink, inRawBlock, lexer }) => {
      if (!inLink && /^<a /i.test(match[0])) {
        inLink = true;
      } else if (inLink && /^<\/a>/i.test(match[0])) {
        inLink = false;
      }
      if (!inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(match[0])) {
        inRawBlock = true;
      } else if (
        inRawBlock &&
        /^<\/(pre|code|kbd|script)(\s|>)/i.test(match[0])
      ) {
        inRawBlock = false;
      }

      return {
        type: lexer.options.sanitize ? "text" : "html",
        raw: match[0],
        inLink,
        inRawBlock,
        text: lexer.options.sanitize
          ? lexer.options.sanitizer
            ? lexer.options.sanitizer(match[0])
            : escape(match[0])
          : match[0]
      };
    },
    pusher: (token, obj) => {
      obj.inLink = token.inLink;
      obj.inRawBlock = token.inRawBlock;
      return token;
    }
  },
  // Link
  {
    inline: true,
    matcher: (src, { lexer }) => lexer.rules.inline.link.exec(src),
    tokenizer: (match, { lexer }) => {
      const lastParenIndex = findClosingBracket(match[2], "()");
      if (lastParenIndex > -1) {
        const start = match[0].indexOf("!") === 0 ? 5 : 4;
        const linkLen = start + match[1].length + lastParenIndex;
        match[2] = match[2].substring(0, lastParenIndex);
        match[0] = match[0].substring(0, linkLen).trim();
        match[3] = "";
      }
      let href = match[2];
      let title = "";
      if (lexer.options.pedantic) {
        const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

        if (link) {
          href = link[1];
          title = link[3];
        } else {
          title = "";
        }
      } else {
        title = match[3] ? match[3].slice(1, -1) : "";
      }
      href = href.trim().replace(/^<([\s\S]*)>$/, "$1");
      return outputLink(
        match,
        {
          href: href ? href.replace(lexer.rules.inline._escapes, "$1") : href,
          title: title
            ? title.replace(lexer.rules.inline._escapes, "$1")
            : title
        },
        match[0]
      );
    },
    pusher: (token, { lexer, inRawBlock }) => {
      if (token.type === "link") {
        token.tokens = lexer.inlineTokens(token.text, [], true, inRawBlock);
      }
      return token;
    }
  },
  // RefLink, NoLink
  {
    inline: true,
    matcher: (src, { lexer }) =>
      lexer.rules.inline.reflink.exec(src) ||
      lexer.rules.inline.nolink.exec(src),
    tokenizer: (match, { lexer }) => {
      let link: any = (match[2] || match[1]).replace(/\s+/g, " ");
      link = lexer.tokens.links[link.toLowerCase()];
      if (!link || !link.href) {
        const text = match[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(match, link, match[0]);
    },
    pusher: (token, { lexer, inRawBlock }) => {
      if (token.type === "link") {
        token.tokens = lexer.inlineTokens(token.text, [], true, inRawBlock);
      }
      return token;
    }
  },
  // Strong
  {
    inline: true,
    matcher: (src, { lexer, prevChar, maskedSrc }) => {
      let match = lexer.rules.inline.strong.start.exec(src);

      if (
        match &&
        (!match[1] ||
          (match[1] &&
            (prevChar === "" || lexer.rules.inline.punctuation.exec(prevChar))))
      ) {
        maskedSrc = maskedSrc.slice(-1 * src.length);
        const endReg =
          match[0] === "**"
            ? lexer.rules.inline.strong.endAst
            : lexer.rules.inline.strong.endUnd;

        endReg.lastIndex = 0;

        let cap;
        while ((match = endReg.exec(maskedSrc)) != null) {
          cap = lexer.rules.inline.strong.middle.exec(
            maskedSrc.slice(0, match.index + 3)
          );
          if (cap) {
            return cap;
          }
        }
      }
      return null;
    },
    tokenizer: (match, { src }) => ({
      type: "strong",
      raw: src.slice(0, match[0].length),
      text: src.slice(2, match[0].length - 2)
    }),
    pusher: (token, { lexer, inLink, inRawBlock }) => {
      token.tokens = lexer.inlineTokens(token.text, [], inLink, inRawBlock);
      return token;
    }
  },
  // Em
  {
    inline: true,
    matcher: (src, { lexer, prevChar, maskedSrc }) => {
      let match = lexer.rules.inline.em.start.exec(src);
      if (
        match &&
        (!match[1] ||
          (match[1] &&
            (prevChar === "" || lexer.rules.inline.punctuation.exec(prevChar))))
      ) {
        maskedSrc = maskedSrc.slice(-1 * src.length);
        const endReg =
          match[0] === "*"
            ? lexer.rules.inline.em.endAst
            : lexer.rules.inline.em.endUnd;

        endReg.lastIndex = 0;

        let cap;
        while ((match = endReg.exec(maskedSrc)) != null) {
          cap = lexer.rules.inline.em.middle.exec(
            maskedSrc.slice(0, match.index + 2)
          );
          if (cap) {
            return cap;
          }
        }
      }
      return null;
    },
    tokenizer: (match, { src }) => ({
      type: "em",
      raw: src.slice(0, match[0].length),
      text: src.slice(1, match[0].length - 1)
    }),
    pusher: (token, { lexer, inLink, inRawBlock }) => {
      token.tokens = lexer.inlineTokens(token.text, [], inLink, inRawBlock);
      return token;
    }
  },
  // Codespan
  {
    inline: true,
    matcher: (src, { lexer }) => lexer.rules.inline.code.exec(src),
    tokenizer: match => {
      let text = match[2].replace(/\n/g, " ");
      const hasNonSpaceChars = /[^ ]/.test(text);
      const hasSpaceCharsOnBothEnds =
        text.startsWith(" ") && text.endsWith(" ");
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      text = escape(text);
      return {
        type: "codespan",
        raw: match[0],
        text
      };
    }
  },
  // Br
  {
    inline: true,
    matcher: (src, { lexer }) => lexer.rules.inline.br.exec(src),
    tokenizer: match => ({
      type: "br",
      raw: match[0]
    })
  },
  // Del
  {
    inline: true,
    matcher: (src, { lexer }) => lexer.rules.inline.del.exec(src),
    tokenizer: match => ({
      type: "del",
      raw: match[0],
      text: match[1]
    }),
    pusher: (token, { lexer, inLink, inRawBlock }) => {
      token.tokens = lexer.inlineTokens(token.text, [], inLink, inRawBlock);
      return token;
    }
  },
  // AutoLink
  {
    inline: true,
    matcher: (src, { lexer }) => lexer.rules.inline.autolink.exec(src),
    tokenizer: (match, { lexer }) => {
      let text, href;
      if (match[2] === "@") {
        text = escape(lexer.options.mangle ? mangle(match[1]) : match[1]);
        href = "mailto:" + text;
      } else {
        text = escape(match[1]);
        href = text;
      }

      return {
        type: "link",
        raw: match[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  },
  // URL
  {
    inline: true,
    matcher: (src, { lexer, inLink }) => {
      if (!inLink) {
        return null;
      }
      return lexer.rules.inline.url.exec(src);
    },
    tokenizer: (match, { lexer }) => {
      let text, href;
      if (match[2] === "@") {
        text = escape(lexer.options.mangle ? mangle(match[0]) : match[0]);
        href = "mailto:" + text;
      } else {
        // do extended autolink path validation
        let prevCapZero;
        do {
          prevCapZero = match[0];
          match[0] = lexer.rules.inline._backpedal.exec(match[0])[0];
        } while (prevCapZero !== match[0]);
        text = escape(match[0]);
        if (match[1] === "www.") {
          href = "http://" + text;
        } else {
          href = text;
        }
      }
      return {
        type: "link",
        raw: match[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  },
  // InlineText
  {
    inline: true,
    matcher: (src, { lexer }) => lexer.rules.inline.text.exec(src),
    tokenizer: (match, { lexer, inRawBlock }) => {
      let text;
      if (inRawBlock) {
        text = lexer.options.sanitize
          ? lexer.options.sanitizer
            ? lexer.options.sanitizer(match[0])
            : escape(match[0])
          : match[0];
      } else {
        text = escape(
          lexer.options.smartypants ? smartypants(match[0]) : match[0]
        );
      }
      return {
        type: "text",
        raw: match[0],
        text
      };
    },
    pusher: (token, obj) => {
      obj.prevChar = token.raw.slice(-1);
      return token;
    }
  }
];

export const extParsers: ExtParser[] = [
  // Tex
  {
    type: "tex",
    parser: token =>
      katex.renderToString((token as Tokens.Tex).text, {
        throwOnError: false
      })
  },
  // CardLink
  {
    type: "card_link",
    parser: (t, parser) => {
      const token = t as Tokens.Link;
      return `<a href="${parser.manager.options.card_link.concatLink(
        token.href
      )}" ${token.title ? `title="${token.title}"` : ""}>${token.text}</a>`;
    }
  },
  // Style
  {
    type: "style",
    parser: t => {
      const token = t as Tokens.Style;
      return `<span style="${convertCss(token.attrs)}">${token.text}</span>`;
    }
  },
  // Sub
  {
    type: "sub",
    parser: token => `<sub>${(token as Tokens.Sub).text}</sub>`
  },
  // Sup
  {
    type: "sup",
    parser: token => `<sup>${(token as Tokens.Sup).text}</sup>`
  },
  // Details
  {
    type: "details",
    parser: t => {
      const token = t as Tokens.Details;
      return `<details><summary>${token.summary}</summary>${token.text}</details>`;
    }
  },
  // Mermaid
  {
    type: "mermaid",
    parser: token =>
      `<div class="mermaid">${(token as Tokens.Mermaid).text}</div>`
  }
];
