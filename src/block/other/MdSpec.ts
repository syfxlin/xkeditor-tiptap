// TODO: 未完成
import { MarkedOptions } from "marked";
import {
  Fragment,
  Mark,
  MarkType,
  Node,
  NodeType,
  Schema
} from "@/utils/prosemirror";
import { MarkdownLexer } from "@/block/other/MarkdownLexer";

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
    depth: number;
    text: string;
    tokens: Token[];
  }

  export interface Table {
    type: "table";
    raw: string;
    header: string[];
    align: Array<"center" | "left" | "right" | null>;
    cells: string[][];
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
    tokens?: Text[];
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

export interface MdParseRule {
  // 匹配流程 type[map O(1)] -> matcher[list-for O(n)]
  type: string;
  matcher?: (token: Token) => boolean;
  getAttrs?: (token: Token) => { [key: string]: any } | undefined;
  getContent?: (
    token: Token,
    schema: Schema,
    parser: (tokens: Token[] | string) => Node[]
  ) => Fragment | Node[] | Node | string | undefined;
  getMarks?: (
    token: Token,
    schema: Schema,
    parser: (tokens: Token[] | string) => Node[]
  ) => Mark[] | undefined;
}

export interface MdSpec {
  // toMarkdown?: ((node: Node, serializeFunction) => string);
  // : return `[[${serializeFunction(node.content)}]]`
  parseMarkdown?: MdParseRule[];
}

export interface ExtTokenizer {
  inline?: boolean;
  matcher: (src: string) => RegExpExecArray | null | boolean;
  tokenizer: (
    match: RegExpExecArray,
    src: string,
    tokens: Token[]
  ) => {
    type: string;
    raw: string;
    [key: string]: any;
  };
}

export class MarkdownParser {
  private readonly schema: Schema;
  private readonly blocks: {
    [tokenType: string]: (MdParseRule & { block: MarkType | NodeType })[];
  };
  private readonly options: MarkedOptions | undefined;
  private readonly extTokenizer: ExtTokenizer[];

  constructor(
    schema: Schema,
    extTokenizer: ExtTokenizer[],
    options?: MarkedOptions
  ) {
    this.schema = schema;
    this.options = options;
    this.extTokenizer = extTokenizer;
    this.blocks = {};
    for (const block of [
      ...Object.values(schema.marks),
      ...Object.values(schema.nodes)
    ]) {
      const parsers = (block.spec as MdSpec).parseMarkdown;
      if (parsers) {
        for (const parser of parsers) {
          if (!(parser.type in this.blocks)) {
            this.blocks[parser.type] = [];
          }
          this.blocks[parser.type].push({
            ...parser,
            block
          });
        }
      }
    }
  }

  parseToken(token: Token): Node | Fragment | Node[] {
    if (!("type" in token)) {
      return this.schema.text(token.raw);
    }
    // space
    if (token.type === "space") {
      return [];
    }
    // paragraph
    if (token.type === "paragraph") {
      return this.schema.node(
        "paragraph",
        undefined,
        this.parseTokens((token as any).tokens)
      );
    }
    // text
    if (token.type === "text") {
      if ((token as any).tokens !== undefined) {
        return this.schema.node(
          "paragraph",
          undefined,
          this.parseTokens((token as any).tokens)
        );
      } else {
        return this.schema.text(token.text);
      }
    }
    const blocks = this.blocks[token.type];
    if (!blocks || blocks.length === 0) {
      return this.schema.text(token.raw);
    }
    for (let i = 0; i < blocks.length; i++) {
      const parser = blocks[i];
      if (blocks.length === 1 || (parser.matcher && parser.matcher(token))) {
        const attrs = parser.getAttrs ? parser.getAttrs(token) : undefined;
        const marks = parser.getMarks
          ? parser.getMarks(token, this.schema, this.parse.bind(this))
          : undefined;
        let content = parser.getContent
          ? parser.getContent(token, this.schema, this.parse.bind(this))
          : undefined;
        if (parser.block instanceof MarkType) {
          const ms = [...(marks || []), parser.block.create(attrs)];
          if (content instanceof Node) {
            content = content.mark([...content.marks, ...ms]);
          } else if (content instanceof Array) {
            content = content.map(item => item.mark([...item.marks, ...ms]));
          } else if (content instanceof Fragment) {
            const nodes: Node[] = [];
            content.forEach(item => {
              nodes.push(item.mark([...item.marks, ...ms]));
            });
            content = nodes;
          } else if (typeof content === "string") {
            content = this.schema.text(content, ms);
          } else if (content === undefined) {
            content = this.schema.node("paragraph", ms);
          }
          return content;
        } else {
          if (typeof content === "string") {
            content = this.schema.text(content);
          }
          return parser.block.create(attrs, content, marks);
        }
      }
    }
    return this.schema.text(token.raw);
  }

  parseTokens(tokens: Token[]): Node[] {
    const parser = this.parseToken.bind(this);
    const result: Node[] = [];
    for (const token of tokens) {
      const fragment = parser(token);
      if (fragment instanceof Node) {
        result.push(fragment);
      }
      if (fragment instanceof Array) {
        result.push(...fragment);
      }
      if (fragment instanceof Fragment) {
        fragment.forEach(item => result.push(item));
      }
    }
    return result;
  }

  parse(markdown: string | Token[]): Node[] {
    if (typeof markdown === "string") {
      markdown = new MarkdownLexer(this.extTokenizer, this.options).lex(
        markdown
      ) as Token[];
    }
    console.log(markdown);
    return this.parseTokens(markdown);
  }
}
