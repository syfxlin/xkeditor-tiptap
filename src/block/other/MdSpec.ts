// TODO: 未完成
import { lexer, MarkedOptions, Token } from "marked";
import {
  Fragment,
  Mark,
  MarkType,
  Node,
  NodeType,
  Schema
} from "@/utils/prosemirror";

export interface MdParseRule {
  // 匹配流程 type[map O(1)] -> matcher[list-for O(n)]
  type: string;
  matcher?: (token: Token) => boolean;
  getAttrs?: (token: Token) => { [key: string]: any } | undefined;
  getContent?: (
    token: Token,
    schema: Schema,
    parser: (tokens: Token[]) => Node[]
  ) => Fragment | Node[] | Node | string | undefined;
  getMarks?: (
    token: Token,
    schema: Schema,
    parser: (tokens: Token[]) => Node[]
  ) => Mark[] | undefined;
}

export interface MdSpec {
  // toMarkdown?: ((node: Node, serializeFunction) => string);
  // : return `[[${serializeFunction(node.content)}]]`
  parseMarkdown?: MdParseRule[];
}

export class MarkdownParser {
  private readonly schema: Schema;
  private readonly blocks: {
    [tokenType: string]: (MdParseRule & { block: MarkType | NodeType })[];
  };
  private readonly options: MarkedOptions | undefined;

  constructor(schema: Schema, options?: MarkedOptions) {
    this.schema = schema;
    this.options = options;
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
        return this.schema.text(token.raw);
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
          ? parser.getMarks(token, this.schema, this.parseTokens.bind(this))
          : undefined;
        let content = parser.getContent
          ? parser.getContent(token, this.schema, this.parseTokens.bind(this))
          : undefined;
        if (parser.block instanceof MarkType) {
          const marks = [parser.block.create(attrs)];
          if (content instanceof Node) {
            content.marks.push(...marks);
          }
          if (content instanceof Array) {
            content.map(item => item.marks.push(...marks));
          }
          if (content instanceof Fragment) {
            const nodes: Node[] = [];
            content.forEach(item => {
              item.marks.push(...marks);
              nodes.push(item);
            });
            content = nodes;
          }
          if (typeof content === "string") {
            content = this.schema.text(content, marks);
          }
          if (content === undefined) {
            content = this.schema.node("paragraph", marks);
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

  parse(markdown: string) {
    return this.parseTokens(lexer(markdown, this.options));
  }
}
