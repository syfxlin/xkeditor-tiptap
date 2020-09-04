import { CommandGetter, Mark } from "tiptap";
import {
  CommandFunction,
  markInputRule,
  markPasteRule,
  toggleMark
} from "tiptap-commands";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";

export default class Italic extends Mark {
  get name() {
    return "italic";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
      toDOM: () => ["em", 0]
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
