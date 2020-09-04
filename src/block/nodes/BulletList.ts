import { CommandGetter, Node } from "tiptap";
import {
  CommandFunction,
  toggleList,
  wrappingInputRule
} from "tiptap-commands";
import { NodeSpec, NodeType, Plugin, Schema } from "@/utils/prosemirror";
import listPlugin from "@/utils/listPlugin";
import { MdSpec } from "@/block/other/MdSpec";
import { Token } from "marked";

export default class BulletList extends Node {
  get name() {
    return "bullet_list";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      content: "list_item+",
      group: "block",
      parseDOM: [{ tag: "ul" }],
      toDOM: () => ["ul", 0],
      parseMarkdown: [
        {
          type: "list",
          matcher: token => "ordered" in token && !token.ordered,
          getContent: (token, s, parser) => {
            if (!("items" in token)) {
              return undefined;
            }
            return parser(token.items as Token[]);
          }
        }
      ]
    };
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: NodeType;
    schema: Schema;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return () => toggleList(type, schema.nodes.list_item);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: Schema;
  }): { [p: string]: CommandFunction } {
    return {
      "Shift-Ctrl-8": toggleList(type, schema.nodes.list_item)
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [wrappingInputRule(/^\s*([-+*])\s$/, type)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return listPlugin(
      /^\s*([-+*])\s(?!\[[-+*xX ]\])/,
      /^\s*([-+*])\s(?!\[[-+*xX ]\])/,
      type,
      schema
    );
  }
}
