import { CommandGetter, Node } from "tiptap";
import {
  CommandFunction,
  toggleList,
  wrappingInputRule
} from "tiptap-commands";
import { NodeSpec, NodeType, Plugin, Schema } from "@/utils/prosemirror";
import listPlugin from "@/utils/listPlugin";
import { MdSpec } from "@/block/other/MdSpec";
import { Tokens } from "@/block/other/MarkdownLexer";

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
          matcher: t => {
            const token = t as Tokens.List;
            if (token.items.length === 0 || !token.items[0].task) {
              return !token.ordered;
            }
            return false;
          },
          getContent: (token, s, parser) => parser((token as Tokens.List).items)
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
