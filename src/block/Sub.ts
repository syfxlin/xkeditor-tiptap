import { CommandGetter, Mark } from "tiptap";
import { CommandFunction, toggleMark } from "tiptap-commands";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import markInputRule from "@/utils/markInputRule";
import markPasteRule from "@/utils/markPasteRule";

export default class Sub extends Mark {
  get name() {
    return "sub";
  }

  get schema(): MarkSpec {
    return {
      parseDOM: [{ tag: "sub" }],
      toDOM: () => ["sub", 0]
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
    return [markInputRule(/-([^_]+)_$/, type)];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [markPasteRule(/-([^_]+)_$/, type)];
  }
}
