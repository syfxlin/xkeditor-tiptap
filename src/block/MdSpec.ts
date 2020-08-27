// TODO: 未完成
import { lexer, Lexer, Token } from "marked";
import { MarkType, NodeType, Schema } from "prosemirror-model";

export interface MdParseRule {
  // 匹配流程 type[map O(1)] -> matcher[list-for O(n)]
  type: string | null;
  matcher?: ((token: Token) => boolean) | null;
  getAttrs?:
    | ((token: Token) => { [key: string]: any } | false | null | undefined)
    | null;
  // getContent?:
  //   | ((token: Token, schema: Schema, parseFunction) => Fragment | Node | string | null)
  //   | null;
  // : type.create(attrs, parseFunction(token.children), marks)
}

export interface MdSpec {
  // toMarkdown?: ((node: Node, serializeFunction) => string) | null;
  // : return `[[${serializeFunction(node.content)}]]`
  parseMarkdown?: MdParseRule[] | null;
}

export class MarkdownParser {
  private schema: Schema;
  private lexer: Lexer;
  private blocks: {
    [tokenType: string]: {
      matcher: ((token: Token) => boolean) | null;
      block: MarkType | NodeType;
    }[];
  };

  constructor(schema: Schema, lexer: Lexer) {
    this.schema = schema;
    this.lexer = lexer;
    this.blocks = {};
    for (const block of [
      ...Object.values(schema.marks),
      ...Object.values(schema.nodes)
    ]) {
      const parsers = (block.spec as MdSpec).parseMarkdown;
      if (parsers) {
        for (const parser of parsers) {
          // @ts-ignore
          if (!this.blocks[parser.type]) {
            // @ts-ignore
            this.blocks[parser.type] = [];
          }
          // @ts-ignore
          this.blocks[parser.type].push({
            matcher: parser.matcher,
            block: block
          });
        }
      }
    }
  }

  parse(markdown: string) {
    const tokens = lexer(markdown);
    for (const token of tokens) {
    }
  }
}
