import { CommandGetter, Mark } from "tiptap";
import {
  CommandFunction,
  markInputRule,
  markPasteRule,
  toggleMark
} from "tiptap-commands";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";

export default class Bold extends Mark {
  get name() {
    return "bold";
  }

  get schema(): MarkSpec & MdSpec {
    return {
      parseDOM: [
        {
          tag: "strong"
        },
        {
          tag: "b",
          getAttrs: node =>
            (node as HTMLElement).style.fontWeight !== "normal" && null
        },
        {
          style: "font-weight",
          getAttrs: value =>
            /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null
        }
      ],
      toDOM: () => ["strong", 0],
      parseMarkdown: [
        {
          type: "strong",
          getContent: (token, parser) =>
            parser.parse((token as Tokens.Strong).tokens)
        }
      ],
      toMarkdown: () => content => `**${content}**`
    };
  }

  keys({
    type,
    schema
  }: {
    type: MarkType;
    schema: Schema;
  }): { [p: string]: CommandFunction } {
    return {
      "Mod-b": toggleMark(type)
    };
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: MarkType;
    schema: Schema;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return () => toggleMark(type);
  }

  inputRules({ type, schema }: { type: MarkType; schema: Schema }): any[] {
    return [markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type)];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [markPasteRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)/g, type)];
  }
}
