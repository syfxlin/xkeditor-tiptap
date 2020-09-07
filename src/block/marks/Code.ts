import { CommandGetter, Mark } from "tiptap";
import {
  CommandFunction,
  markInputRule,
  markPasteRule,
  toggleMark
} from "tiptap-commands";
import { MarkType, Plugin, Schema } from "@/utils/prosemirror";
import { MarkSpec } from "prosemirror-model";
import { MdSpec, Tokens } from "@/block/other/MdSpec";

export default class Code extends Mark {
  get name() {
    return "code";
  }

  get schema(): MarkSpec & MdSpec {
    return {
      excludes: "_",
      parseDOM: [{ tag: "code" }],
      toDOM: () => ["code", 0],
      parseMarkdown: [
        {
          type: "codespan",
          getContent: token => (token as Tokens.Codespan).text
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
      "Mod-`": toggleMark(type)
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
    return [markInputRule(/(?:`)([^`]+)(?:`)$/, type)];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [markPasteRule(/(?:`)([^`]+)(?:`)/g, type)];
  }
}
