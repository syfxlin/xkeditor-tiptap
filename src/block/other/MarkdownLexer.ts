import { Lexer, MarkedOptions } from "marked";
import { ExtTokenizer } from "@/block/other/MdSpec";

function smartypants(text: string) {
  return (
    text
      // em-dashes
      .replace(/---/g, "\u2014")
      // en-dashes
      .replace(/--/g, "\u2013")
      // opening singles
      // eslint-disable-next-line no-useless-escape
      .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018")
      // closing singles & apostrophes
      .replace(/'/g, "\u2019")
      // opening doubles
      // eslint-disable-next-line no-useless-escape
      .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201c")
      // closing doubles
      .replace(/"/g, "\u201d")
      // ellipses
      .replace(/\.{3}/g, "\u2026")
  );
}

/**
 * mangle email addresses
 */
function mangle(text: string) {
  let out = "",
    i,
    ch;

  const l = text.length;
  for (i = 0; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = "x" + ch.toString(16);
    }
    out += "&#" + ch + ";";
  }

  return out;
}

export class MarkdownLexer extends Lexer {
  private readonly inlineTzr: ExtTokenizer[];
  private readonly blockTzr: ExtTokenizer[];
  // @ts-ignore
  private tokenizer: any;

  constructor(tokenizers: ExtTokenizer[], options?: MarkedOptions) {
    super(options);
    this.inlineTzr = [];
    this.blockTzr = [];
    for (const tokenizer of tokenizers) {
      if (tokenizer.inline) {
        this.inlineTzr.push(tokenizer);
      } else {
        this.blockTzr.push(tokenizer);
      }
    }
  }

  blockTokens(src: string, tokens: any[] = [], top = true) {
    src = src.replace(/^ +$/gm, "");
    let token, i, l, lastToken, matched;

    while (src) {
      matched = false;

      // newline
      if ((token = this.tokenizer.space(src))) {
        src = src.substring(token.raw.length);
        if (token.type) {
          tokens.push(token);
        }
        continue;
      }

      for (const tzr of this.blockTzr) {
        let match = tzr.matcher(src);
        if (match !== null && match) {
          matched = true;
          if (typeof match === "boolean") {
            // @ts-ignore
            const matchArr: RegExpExecArray = [src];
            matchArr.index = 0;
            matchArr.input = src;
            match = matchArr;
          }
          token = tzr.tokenizer(match, src, tokens);
          const left = src.substring(0, match.index);
          src = src.substring(match.index + token.raw.length);
          tokens.push(...this.blockTokens(left, [], top));
          tokens.push(token);
          break;
        }
      }
      if (matched) {
        continue;
      }

      // code
      if ((token = this.tokenizer.code(src, tokens))) {
        src = src.substring(token.raw.length);
        if (token.type) {
          tokens.push(token);
        } else {
          lastToken = tokens[tokens.length - 1];
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
        }
        continue;
      }

      // fences
      if ((token = this.tokenizer.fences(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // heading
      if ((token = this.tokenizer.heading(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // table no leading pipe (gfm)
      if ((token = this.tokenizer.nptable(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // hr
      if ((token = this.tokenizer.hr(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // blockquote
      if ((token = this.tokenizer.blockquote(src))) {
        src = src.substring(token.raw.length);
        token.tokens = this.blockTokens(token.text, [], top);
        tokens.push(token);
        continue;
      }

      // list
      if ((token = this.tokenizer.list(src))) {
        src = src.substring(token.raw.length);
        l = token.items.length;
        for (i = 0; i < l; i++) {
          token.items[i].tokens = this.blockTokens(
            token.items[i].text,
            [],
            false
          );
        }
        tokens.push(token);
        continue;
      }

      // html
      if ((token = this.tokenizer.html(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // def
      if (top && (token = this.tokenizer.def(src))) {
        src = src.substring(token.raw.length);
        if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }

      // table (gfm)
      if ((token = this.tokenizer.table(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // lheading
      if ((token = this.tokenizer.lheading(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // top-level paragraph
      if (top && (token = this.tokenizer.paragraph(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // text
      if ((token = this.tokenizer.text(src, tokens))) {
        src = src.substring(token.raw.length);
        if (token.type) {
          tokens.push(token);
        } else {
          lastToken = tokens[tokens.length - 1];
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
        }
        continue;
      }

      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }

    return tokens;
  }

  inlineTokens(
    src: string,
    tokens: any[] = [],
    inLink = false,
    inRawBlock = false,
    prevChar = ""
  ) {
    let token;

    // String with links masked to avoid interference with em and strong
    let maskedSrc = src;
    let match;

    // Mask out reflinks
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while (
          (match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) !=
          null
        ) {
          if (
            links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))
          ) {
            maskedSrc =
              maskedSrc.slice(0, match.index) +
              "[" +
              "a".repeat(match[0].length - 2) +
              "]" +
              maskedSrc.slice(
                this.tokenizer.rules.inline.reflinkSearch.lastIndex
              );
          }
        }
      }
    }
    // Mask out other blocks
    while (
      (match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null
    ) {
      maskedSrc =
        maskedSrc.slice(0, match.index) +
        "[" +
        "a".repeat(match[0].length - 2) +
        "]" +
        maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }

    while (src) {
      // escape
      if ((token = this.tokenizer.escape(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // tag
      if ((token = this.tokenizer.tag(src, inLink, inRawBlock))) {
        src = src.substring(token.raw.length);
        inLink = token.inLink;
        inRawBlock = token.inRawBlock;
        tokens.push(token);
        continue;
      }

      // link
      if ((token = this.tokenizer.link(src))) {
        src = src.substring(token.raw.length);
        if (token.type === "link") {
          token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
        }
        tokens.push(token);
        continue;
      }

      // reflink, nolink
      if ((token = this.tokenizer.reflink(src, this.tokens.links))) {
        src = src.substring(token.raw.length);
        if (token.type === "link") {
          token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
        }
        tokens.push(token);
        continue;
      }

      // strong
      if ((token = this.tokenizer.strong(src, maskedSrc, prevChar))) {
        src = src.substring(token.raw.length);
        token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
        tokens.push(token);
        continue;
      }

      // em
      if ((token = this.tokenizer.em(src, maskedSrc, prevChar))) {
        src = src.substring(token.raw.length);
        token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
        tokens.push(token);
        continue;
      }

      // code
      if ((token = this.tokenizer.codespan(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // br
      if ((token = this.tokenizer.br(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // del (gfm)
      if ((token = this.tokenizer.del(src))) {
        src = src.substring(token.raw.length);
        token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
        tokens.push(token);
        continue;
      }

      // autolink
      if ((token = this.tokenizer.autolink(src, mangle))) {
        src = src.substring(token.raw.length);
        tokens.push(token);

        continue;
      }

      // url (gfm)
      if (!inLink && (token = this.tokenizer.url(src, mangle))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // inline tzr
      let matched = false;
      for (const tzr of this.inlineTzr) {
        const match = tzr.matcher(src);
        if (match !== null && match) {
          matched = true;
          if (typeof match === "boolean") {
            // @ts-ignore
            const matchArr: RegExpExecArray = [src];
            matchArr.index = 0;
            matchArr.input = src;
            token = tzr.tokenizer(matchArr, src, tokens);
            src = src.substring(token.raw.length);
          } else {
            token = tzr.tokenizer(match, src, tokens);
            const left = src.substring(0, match.index);
            src = src.substring(match.index + token.raw.length);
            tokens.push(
              ...this.inlineTokens(left, [], inLink, inRawBlock, prevChar)
            );
          }
          tokens.push(token);
          break;
        }
      }
      if (matched) {
        continue;
      }

      // text
      if ((token = this.tokenizer.inlineText(src, inRawBlock, smartypants))) {
        src = src.substring(token.raw.length);
        prevChar = token.raw.slice(-1);
        tokens.push(token);
        continue;
      }

      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }

    return tokens;
  }
}
