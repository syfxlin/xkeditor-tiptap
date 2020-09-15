import { CommandGetter, Mark } from "tiptap";
import { CommandFunction, toggleMark } from "tiptap-commands";
import { MarkSpec, MarkType, Schema } from "@/utils/prosemirror";
import { MdSpec } from "@/marked/MdSpec";

export default class Underline extends Mark {
  get name() {
    return "underline";
  }

  get schema(): MarkSpec & MdSpec {
    return {
      parseDOM: [
        {
          tag: "u"
        },
        {
          style: "text-decoration",
          // @ts-ignore
          getAttrs: value => value === "underline"
        }
      ],
      toDOM: () => ["u", 0],
      toMarkdown: () => content => `<u>${content}</u>`
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
      "Mod-u": toggleMark(type)
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
}
