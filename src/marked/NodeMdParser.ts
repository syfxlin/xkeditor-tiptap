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
import { ExtensionManager } from "tiptap";

export interface MdParseRule {
  // 匹配流程 type[map O(1)] -> matcher[list-for O(n)]
  type: string;
  matcher?: (token: Token) => boolean;
  getAttrs?: (token: Token) => { [key: string]: any } | undefined;
  getContent?: (
    token: Token,
    parser: NodeMdParser
  ) => Fragment | Node[] | Node | string | undefined;
  getMarks?: (token: Token, parser: NodeMdParser) => Mark[] | undefined;
}

export class NodeMdParser {
  public readonly schema: Schema;
  public readonly manager: ExtensionManager;
  private readonly blocks: {
    [tokenType: string]: (MdParseRule & { block: MarkType | NodeType })[];
  };
  private readonly options: MarkedOptions | undefined;
  private readonly extTokenizer: ExtTokenizer[] | undefined;

  constructor(
    manager: ExtensionManager,
    options?: MarkedOptions,
    extTokenizer?: ExtTokenizer[]
  ) {
    this.manager = manager;
    this.schema = manager.view.state.schema;
    this.options = options;
    this.extTokenizer = extTokenizer;
    this.blocks = {};
    for (const block of [
      ...Object.values(this.schema.marks),
      ...Object.values(this.schema.nodes)
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

  private parseToken(token: Token): Node | Fragment | Node[] {
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
          ? parser.getMarks(token, this)
          : undefined;
        let content = parser.getContent
          ? parser.getContent(token, this)
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

  private parseTokens(tokens: Token[]): Node[] {
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
      markdown = new MdLexer(this.options, this.extTokenizer).lex(
        markdown
      ) as Token[];
    }
    if (!(markdown instanceof Array)) {
      markdown = [markdown];
    }
    return this.parseTokens(markdown);
  }
}
