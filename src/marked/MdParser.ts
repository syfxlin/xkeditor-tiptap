import { MarkedOptions, Parser, Renderer, TokensList } from "marked";
import { Token } from "@/marked/MdLexer";

export interface ExtParser {
  type: string;
  parser: (token: Token, parser: MdParser) => string;
}

export default class MdParser extends Parser {
  private readonly parsers: { [type: string]: ExtParser };

  constructor(parsers?: ExtParser[], options?: MarkedOptions) {
    super(options);
    this.parsers = {};
    if (parsers) {
      for (const parser of parsers) {
        this.parsers[parser.type] = parser;
      }
    }
  }

  // @ts-ignore
  parse(tokens: TokensList, top = true) {
    let out = "",
      i,
      j,
      k,
      l2,
      l3,
      row,
      cell,
      header,
      body,
      token,
      ordered,
      start,
      loose,
      itemBody,
      item,
      checked,
      task,
      checkbox;

    const l = tokens.length;
    for (i = 0; i < l; i++) {
      token = tokens[i] as any;
      switch (token.type) {
        case "space": {
          break;
        }
        case "hr": {
          out += this.renderer.hr();
          break;
        }
        case "heading": {
          out += this.renderer.heading(
            this.parseInline(token.tokens),
            token.depth,
            // @ts-ignore
            unescape(this.parseInline(token.tokens, this.textRenderer)),
            this.slugger
          );
          break;
        }
        case "code": {
          out += this.renderer.code(token.text, token.lang, token.escaped);
          break;
        }
        case "table": {
          header = "";

          // header
          cell = "";
          l2 = token.header.length;
          for (j = 0; j < l2; j++) {
            cell += this.renderer.tablecell(
              this.parseInline(token.tokens.header[j]),
              { header: true, align: token.align[j] }
            );
          }
          header += this.renderer.tablerow(cell);

          body = "";
          l2 = token.cells.length;
          for (j = 0; j < l2; j++) {
            row = token.tokens.cells[j];

            cell = "";
            l3 = row.length;
            for (k = 0; k < l3; k++) {
              cell += this.renderer.tablecell(this.parseInline(row[k]), {
                header: false,
                align: token.align[k]
              });
            }

            body += this.renderer.tablerow(cell);
          }
          out += this.renderer.table(header, body);
          break;
        }
        case "blockquote": {
          body = this.parse(token.tokens) as string;
          out += this.renderer.blockquote(body);
          break;
        }
        case "list": {
          ordered = token.ordered;
          start = token.start;
          loose = token.loose;
          l2 = token.items.length;

          body = "";
          for (j = 0; j < l2; j++) {
            item = token.items[j];
            checked = item.checked;
            task = item.task;

            itemBody = "";
            if (item.task) {
              checkbox = this.renderer.checkbox(checked);
              if (loose) {
                if (item.tokens.length > 0 && item.tokens[0].type === "text") {
                  item.tokens[0].text = checkbox + " " + item.tokens[0].text;
                  if (
                    item.tokens[0].tokens &&
                    item.tokens[0].tokens.length > 0 &&
                    item.tokens[0].tokens[0].type === "text"
                  ) {
                    item.tokens[0].tokens[0].text =
                      checkbox + " " + item.tokens[0].tokens[0].text;
                  }
                } else {
                  item.tokens.unshift({
                    type: "text",
                    text: checkbox
                  });
                }
              } else {
                itemBody += checkbox;
              }
            }

            itemBody += this.parse(item.tokens, loose);
            // @ts-ignore
            body += this.renderer.listitem(itemBody, task, checked);
          }

          out += this.renderer.list(body, ordered, start);
          break;
        }
        case "html": {
          // TODO parse inline content if parameter markdown=1
          out += this.renderer.html(token.text);
          break;
        }
        case "paragraph": {
          out += this.renderer.paragraph(this.parseInline(token.tokens));
          break;
        }
        case "text": {
          body = token.tokens ? this.parseInline(token.tokens) : token.text;
          while (i + 1 < l && (tokens[i + 1] as any).type === "text") {
            token = tokens[++i] as any;
            body +=
              "\n" +
              (token.tokens ? this.parseInline(token.tokens) : token.text);
          }
          out += top ? this.renderer.paragraph(body) : body;
          break;
        }
        default: {
          const parser = this.parsers[token.type];
          if (parser) {
            out += parser.parser(token, this);
            break;
          }
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return;
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }

    return out;
  }

  parseInline(tokens: TokensList, renderer?: Renderer): string {
    renderer = renderer || this.renderer;
    let out = "",
      i,
      token;

    const l = tokens.length;
    for (i = 0; i < l; i++) {
      token = tokens[i] as any;
      switch (token.type) {
        case "escape": {
          out += renderer.text(token.text);
          break;
        }
        case "html": {
          out += renderer.html(token.text);
          break;
        }
        case "link": {
          out += renderer.link(
            token.href,
            token.title,
            this.parseInline(token.tokens, renderer)
          );
          break;
        }
        case "image": {
          out += renderer.image(token.href, token.title, token.text);
          break;
        }
        case "strong": {
          out += renderer.strong(this.parseInline(token.tokens, renderer));
          break;
        }
        case "em": {
          out += renderer.em(this.parseInline(token.tokens, renderer));
          break;
        }
        case "codespan": {
          out += renderer.codespan(token.text);
          break;
        }
        case "br": {
          out += renderer.br();
          break;
        }
        case "del": {
          out += renderer.del(this.parseInline(token.tokens, renderer));
          break;
        }
        case "text": {
          out += renderer.text(token.text);
          break;
        }
        default: {
          const parser = this.parsers[token.type];
          if (parser) {
            out += parser.parser(token, this);
            break;
          }
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
}
