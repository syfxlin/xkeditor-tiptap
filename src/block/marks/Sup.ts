import { CommandGetter, Mark } from "tiptap";
import { CommandFunction, toggleMark } from "tiptap-commands";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import markInputRule from "@/utils/markInputRule";
import markPasteRule from "@/utils/markPasteRule";
import { MdSpec } from "@/block/other/MdSpec";
import { Tokens } from "@/block/other/MarkdownLexer";

export default class Sup extends Mark {
  get name() {
    return "sup";
  }

  get schema(): MarkSpec & MdSpec {
    return {
      parseDOM: [{ tag: "sup" }],
      toDOM: () => ["sup", 0],
      parseMarkdown: [
        {
          type: "sup",
          getContent: token => (token as Tokens.Sup).text
        }
      ],
      toMarkdown: () => content => `^${content}-`
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
    return [markInputRule(/\^([^-]+)-$/, type)];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [markPasteRule(/\^([^-]+)-$/, type)];
  }
}
