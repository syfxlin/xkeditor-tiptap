import { MarkedOptions, Parser, Renderer } from "marked";
import { Token } from "@/marked/MdLexer";
import { Schema } from "prosemirror-model";
import { ExtensionManager } from "tiptap";
import MdSlugger from "@/marked/MdSlugger";

export interface ExtParser {
  type: string;
  parser: (
    token: Token,
    obj: {
      parser: MdParser;
      tokens: any[];
      renderer: Renderer;
      [key: string]: any;
    }
  ) => string | null;
}

export default class MdParser extends Parser {
  public readonly schema: Schema;
  public readonly manager: ExtensionManager;
  private readonly parsers: { [type: string]: ExtParser };

  constructor(
    manager: ExtensionManager,
    extParsers?: ExtParser[],
    options?: MarkedOptions
  ) {
    super(options);
    this.slugger = new MdSlugger();
    this.manager = manager;
    this.schema = manager.view.state.schema;
    this.parsers = {};
    if (extParsers) {
      for (const parser of extParsers) {
        this.parsers[parser.type] = parser;
      }
    }
  }

  // @ts-ignore
  parse(tokens: any[], top = true) {
    let out = "";

    const length = tokens.length;
    for (let i = 0; i < length; i++) {
      let token = tokens[i] as any;
      const parser = this.parsers[token.type];
      if (parser) {
        out +=
          parser.parser(token, {
            parser: this,
            renderer: this.renderer,
            tokens,
            top
          }) || "";
        continue;
      }
      if (token.type === "text") {
        let body = token.tokens ? this.parseInline(token.tokens) : token.text;
        while (i + 1 < length && (tokens[i + 1] as any).type === "text") {
          token = tokens[++i] as any;
          body +=
            "\n" + (token.tokens ? this.parseInline(token.tokens) : token.text);
        }
        out += top ? this.renderer.paragraph(body) : body;
        continue;
      }
      const errMsg = 'Token with "' + token.type + '" type was not found.';
      if (this.options.silent) {
        console.error(errMsg);
        return;
      } else {
        throw new Error(errMsg);
      }
    }

    return out;
  }

  parseInline(tokens: any[], renderer?: Renderer): string {
    renderer = renderer || this.renderer;
    let out = "";
    const length = tokens.length;
    for (let i = 0; i < length; i++) {
      const token = tokens[i] as any;
      const parser = this.parsers[token.type];
      if (parser) {
        out += parser.parser(token, { parser: this, tokens, renderer }) || "";
        continue;
      }
      const errMsg = 'Token with "' + token.type + '" type was not found.';
      if (this.options.silent) {
        console.error(errMsg);
        return "";
      } else {
        throw new Error(errMsg);
      }
    }
    return out;
  }
}
