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
          getContent: (token, parser) =>
            parser.parse((token as Tokens.Del).tokens)
        }
      ],
      toMarkdown: () => content => `~${content}~`
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
