import { CommandGetter, Mark } from "tiptap";
import { CommandFunction, toggleMark } from "tiptap-commands";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import markInputRule from "@/utils/markInputRule";
import markPasteRule from "@/utils/markPasteRule";

export default class Sup extends Mark {
  get name() {
    return "sup";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [{ tag: "sup" }],
      toDOM: () => ["sup", 0]
    };
  }

  keys({
    type,
    schema
  }: {
    type: MarkType;
    schema: MarkSpec;
  }): { [p: string]: CommandFunction } {
    return {
      "Mod-Shift-p": toggleMark(type)
    };
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: MarkType;
    schema: MarkSpec;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return () => toggleMark(type);
  }

  inputRules({ type, schema }: { type: MarkType; schema: Schema }): any[] {
    return [markInputRule(/-([^-]+)-$/, type)];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [markPasteRule(/-([^-]+)-$/, type)];
  }
}
