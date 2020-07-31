import { CommandGetter, Node } from "tiptap";
import {
  CommandFunction,
  toggleList,
  wrappingInputRule
} from "tiptap-commands";
import { NodeSpec, NodeType, Plugin, Schema } from "@/utils/prosemirror";
import listPlugin from "@/utils/listPlugin";

export default class BulletList extends Node {
  get name() {
    return "bullet_list";
  }

  get schema(): NodeSpec {
    return {
      content: "list_item+",
      group: "block",
      parseDOM: [{ tag: "ul" }],
      toDOM: () => ["ul", 0]
    };
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: NodeType;
    schema: NodeSpec;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return () => toggleList(type, schema.nodes.list_item);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: NodeSpec;
  }): { [p: string]: CommandFunction } {
    return {
      "Shift-Ctrl-8": toggleList(type, schema.nodes.list_item)
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [wrappingInputRule(/^\s*([-+*])\s$/, type)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return listPlugin(/^\s*([-+*])\s[^[]/, /([-+*])\s[^[]/, type, schema);
  }
}
