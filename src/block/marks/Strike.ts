import { CommandGetter, Mark } from "tiptap";
import {
  CommandFunction,
  markInputRule,
  markPasteRule,
  toggleMark
} from "tiptap-commands";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import { MdSpec } from "@/block/other/MdSpec";
import { Tokens } from "@/block/other/MarkdownLexer";

export default class Strike extends Mark {
  get name() {
    return "strike";
  }

  get schema(): MarkSpec & MdSpec {
    return {
      parseDOM: [
        {
          tag: "s"
        },
        {
          tag: "del"
        },
        {
          tag: "strike"
        },
        {
          style: "text-decoration",
          // @ts-ignore
          getAttrs: value => value === "line-through"
        }
      ],
      toDOM: () => ["s", 0],
      parseMarkdown: [
        {
          type: "del",
          getContent: (token, s, parser) => parser((token as Tokens.Del).tokens)
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
      "Mod-d": toggleMark(type)
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
    return [markInputRule(/~([^~]+)~$/, type)];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [markPasteRule(/~([^~]+)~/g, type)];
  }
}
