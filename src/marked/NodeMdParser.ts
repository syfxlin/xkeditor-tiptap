import {
  Fragment,
  Mark,
  MarkType,
  Node,
  NodeType,
  Schema
} from "@/utils/prosemirror";
import { MarkedOptions } from "marked";
import { ExtTokenizer, MdLexer, Token } from "@/marked/MdLexer";
import { MdSpec } from "@/marked/MdSpec";

export interface MdParseRule {
  // 匹配流程 type[map O(1)] -> matcher[list-for O(n)]
  type: string;
  matcher?: (token: Token) => boolean;
  getAttrs?: (token: Token) => { [key: string]: any } | undefined;
  getContent?: (
    token: Token,
    schema: Schema,
    parser: (tokens: Token[] | Token | string) => Node[]
  ) => Fragment | Node[] | Node | string | undefined;
  getMarks?: (
    token: Token,
    schema: Schema,
    parser: (tokens: Token[] | Token | string) => Node[]
  ) => Mark[] | undefined;
}

export class NodeMdParser {
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

  parse(markdown: string | Token[] | Token): Node[] {
    if (typeof markdown === "string") {
      markdown = new MdLexer(this.extTokenizer, this.options).lex(
        markdown
      ) as Token[];
    }
    if (!(markdown instanceof Array)) {
      markdown = [markdown];
    }
    console.log(markdown);
    return this.parseTokens(markdown);
  }
}
