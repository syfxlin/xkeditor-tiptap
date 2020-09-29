import { Lexer, MarkedOptions } from "marked";

// eslint-disable-next-line
export namespace Tokens {
  export interface Space {
    type: "space";
    raw: string;
  }

  export interface Code {
    type: "code";
    raw: string;
    codeBlockStyle?: "indented";
    lang?: string;
    text: string;
  }

  export interface Heading {
    type: "heading";
    raw: string;
    depth: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
    tokens: Token[];
  }

  export interface Table {
    type: "table";
    raw: string;
    header: string[];
    align: Array<"center" | "left" | "right" | null>;
    cells: string[][];
    tokens: {
      header: Token[][];
      cells: Token[][];
    };
  }

  export interface Hr {
    type: "hr";
    raw: string;
  }

  export interface Blockquote {
    type: "blockquote";
    raw: string;
    text: string;
    tokens: Token[];
  }

  export interface BlockquoteStart {
    type: "blockquote_start";
    raw: string;
  }

  export interface BlockquoteEnd {
    type: "blockquote_end";
    raw: string;
  }

  export interface List {
    type: "list_start";
    raw: string;
    ordered: boolean;
    start: boolean;
    loose: boolean;
    items: ListItem[];
  }

  export interface ListItem {
    type: "list_item";
    raw: string;
    task: boolean;
    checked: boolean;
    loose: boolean;
    text: string;
    tokens: Token[];
  }

  export interface Paragraph {
    type: "paragraph";
    raw: string;
    pre?: boolean;
    text: string;
    tokens: Token[];
  }

  export interface HTML {
    type: "html";
    raw: string;
    pre: boolean;
    text: string;
  }

  export interface Text {
    type: "text";
    raw: string;
    text: string;
  }

  export interface Def {
    raw: string;
    href: string;
    title: string;
  }

  export interface Escape {
    type: "escape";
    raw: string;
    text: string;
  }

  export interface Tag {
    type: "text" | "html";
    raw: string;
    inLink: boolean;
    inRawBlock: boolean;
    text: string;
  }

  export interface Link {
    type: "link";
    raw: string;
    href: string;
    title: string;
    text: string;
    tokens: Text[];
  }

  export interface Image {
    type: "image";
    raw: string;
    href: string;
    title: string;
    text: string;
  }

  export interface Strong {
    type: "strong";
    raw: string;
    text: string;
    tokens: Token[];
  }

  export interface Em {
    type: "em";
    raw: string;
    text: string;
    tokens: Token[];
  }

  export interface Codespan {
    type: "codespan";
    raw: string;
    text: string;
  }

  export interface Br {
    type: "br";
    raw: string;
  }

  export interface Del {
    type: "del";
    raw: string;
    text: string;
    tokens: Token[];
  }

  export interface Tex {
    type: "tex";
    raw: string;
    text: string;
  }

  export interface Style {
    type: "style";
    raw: string;
    text: string;
    attrs: {
      [key: string]: any;
    };
  }

  export interface Sub {
    type: "sub";
    raw: string;
    text: string;
  }

  export interface Sup {
    type: "sup";
    raw: string;
    text: string;
  }

  export interface Toc {
    type: "toc";
    raw: string;
    fold: boolean;
  }

  export interface Details {
    type: "details";
    raw: string;
    text: string;
    summary: string;
  }

  export interface Mermaid {
    type: "mermaid";
    raw: string;
    text: string;
  }
}

export type Token =
  | Tokens.Space
  | Tokens.Code
  | Tokens.Heading
  | Tokens.Table
  | Tokens.Hr
  | Tokens.Blockquote
  | Tokens.BlockquoteStart
  | Tokens.BlockquoteEnd
  | Tokens.List
  | Tokens.ListItem
  | Tokens.Paragraph
  | Tokens.HTML
  | Tokens.Text
  | Tokens.Def
  | Tokens.Escape
  | Tokens.Tag
  | Tokens.Image
  | Tokens.Link
  | Tokens.Strong
  | Tokens.Em
  | Tokens.Codespan
  | Tokens.Br
  | Tokens.Del
  | Tokens.Tex
  | Tokens.Style
  | Tokens.Sub
  | Tokens.Sup
  | Tokens.Toc
  | Tokens.Details
  | Tokens.Mermaid;

export interface ExtTokenizer {
  inline?: boolean;
  matcher: (
    src: string,
    obj: { lexer: MdLexer; tokens: any[]; src: string; [key: string]: any }
  ) => RegExpExecArray | null | boolean;
  tokenizer: (
    match: RegExpExecArray,
    obj: { lexer: MdLexer; tokens: any[]; src: string; [key: string]: any }
  ) => {
    type?: string;
    raw: string;
    [key: string]: any;
  };
  pusher?: (
    token: any,
    obj: { lexer: MdLexer; tokens: any[]; [key: string]: any }
  ) => null | any;
}

export class MdLexer extends Lexer {
  private readonly inlineTzr: ExtTokenizer[];
  private readonly blockTzr: ExtTokenizer[];
  // @ts-ignore
  public tokenizer: any;
  public rules: any;

  constructor(tokenizers?: ExtTokenizer[], options?: MarkedOptions) {
    super(options);
    this.inlineTzr = [];
    this.blockTzr = [];
    if (tokenizers) {
      for (const tokenizer of tokenizers) {
        if (tokenizer.inline) {
          this.inlineTzr.push(tokenizer);
        } else {
          this.blockTzr.push(tokenizer);
        }
      }
    }
    this.rules = this.tokenizer.rules;
  }

  blockTokens(src: string, tokens: any[] = [], top = true) {
    const obj: {
      src: string;
      token: any;
      tokens: any[];
      top: boolean;
      lexer: MdLexer;
    } = {
      src: src.replace(/^ +$/gm, ""),
      token: undefined,
      tokens,
      top,
      lexer: this
    };
    let matched;

    while (obj.src) {
      matched = false;

      for (const tzr of this.blockTzr) {
        let match = tzr.matcher(obj.src, obj);
        if (match !== null && match) {
          matched = true;
          if (typeof match === "boolean") {
            // @ts-ignore
            const matchArr: RegExpExecArray = [obj.src];
            matchArr.index = 0;
            matchArr.input = obj.src;
            match = matchArr;
          }
          obj.token = tzr.tokenizer(match, obj);
          const left = obj.src.substring(0, match.index);
          obj.src = obj.src.substring(match.index + obj.token.raw.length);
          obj.tokens.push(...this.blockTokens(left, [], obj.top));
          if (tzr.pusher) {
            const result = tzr.pusher(obj.token, obj);
            if (result !== null) {
              if (result instanceof Array) {
                obj.tokens.push(...result);
              } else {
                obj.tokens.push(result);
              }
            }
          } else {
            obj.tokens.push(obj.token);
          }
          break;
        }
      }
      if (matched) {
        continue;
      }

      if (src) {
        const errMsg = "Infinite loop on byte: " + obj.src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }

    return obj.tokens;
  }

  inlineTokens(
    src: string,
    tokens: any[] = [],
    inLink = false,
    inRawBlock = false,
    prevChar = ""
  ) {
    const obj: {
      src: string;
      tokens: any[];
      inLink: boolean;
      inRawBlock: boolean;
      prevChar: string;
      token: any;
      maskedSrc: string;
      lexer: MdLexer;
    } = {
      src,
      tokens,
      inLink,
      inRawBlock,
      prevChar,
      token: undefined,
      maskedSrc: src,
      lexer: this
    };
    // String with links masked to avoid interference with em and strong
    let match;

    // Mask out reflinks
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while (
          (match = this.tokenizer.rules.inline.reflinkSearch.exec(
            obj.maskedSrc
          )) != null
        ) {
          if (
            links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))
          ) {
            obj.maskedSrc =
              obj.maskedSrc.slice(0, match.index) +
              "[" +
              "a".repeat(match[0].length - 2) +
              "]" +
              obj.maskedSrc.slice(
                this.tokenizer.rules.inline.reflinkSearch.lastIndex
              );
          }
        }
      }
    }
    // Mask out other blocks
    while (
      (match = this.tokenizer.rules.inline.blockSkip.exec(obj.maskedSrc)) !=
      null
    ) {
      obj.maskedSrc =
        obj.maskedSrc.slice(0, match.index) +
        "[" +
        "a".repeat(match[0].length - 2) +
        "]" +
        obj.maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }

    while (obj.src) {
      // inline tzr
      let matched = false;
      for (const tzr of this.inlineTzr) {
        const match = tzr.matcher(obj.src, obj);
        if (match !== null && match) {
          matched = true;
          if (typeof match === "boolean") {
            // @ts-ignore
            const matchArr: RegExpExecArray = [src];
            matchArr.index = 0;
            matchArr.input = obj.src;
            obj.token = tzr.tokenizer(matchArr, obj);
            obj.src = obj.src.substring(obj.token.raw.length);
          } else {
            obj.token = tzr.tokenizer(match, obj);
            const left = obj.src.substring(0, match.index);
            obj.src = obj.src.substring(match.index + obj.token.raw.length);
            obj.tokens.push(
              ...this.inlineTokens(
                left,
                [],
                obj.inLink,
                obj.inRawBlock,
                obj.prevChar
              )
            );
          }
          if (tzr.pusher) {
            const result = tzr.pusher(obj.token, obj);
            if (result !== null) {
              if (result instanceof Array) {
                obj.tokens.push(...result);
              } else {
                obj.tokens.push(result);
              }
            }
          } else {
            obj.tokens.push(obj.token);
          }
          break;
        }
      }
      if (matched) {
        continue;
      }

      if (obj.src) {
        const errMsg = "Infinite loop on byte: " + obj.src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }

    return obj.tokens;
  }
}
