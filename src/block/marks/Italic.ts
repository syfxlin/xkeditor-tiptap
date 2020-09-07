import { CommandGetter, Mark } from "tiptap";
import {
  CommandFunction,
  markInputRule,
  markPasteRule,
  toggleMark
} from "tiptap-commands";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import { MdSpec, Tokens } from "@/block/other/MdSpec";

export default class Italic extends Mark {
  get name() {
    return "italic";
  }

  get schema(): MarkSpec & MdSpec {
    return {
      parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
      toDOM: () => ["em", 0],
      // TODO: 不能成功插入
      parseMarkdown: [
        {
          type: "em",
          getContent: (token, s, parser) => parser((token as Tokens.Em).tokens)
        }
      ]
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
      "Mod-i": toggleMark(type)
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
    return [
      markInputRule(/(?:^|[^_])(_([^_]+)_)$/, type),
      markInputRule(/(?:^|[^*])(\*([^*]+)\*)$/, type)
    ];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [
      markPasteRule(/_([^_]+)_/g, type),
      markPasteRule(/\*([^*]+)\*/g, type)
    ];
  }
}
