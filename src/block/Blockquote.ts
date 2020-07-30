import { CommandGetter, Node } from "tiptap";
import {
  CommandFunction,
  toggleWrap,
  wrappingInputRule
} from "tiptap-commands";
import { NodeSpec, NodeType, Plugin, Schema } from "@/utils/prosemirror";
import nodeLinePasteRule from "@/utils/nodeLinePasteRule";

export default class Blockquote extends Node {
  get name() {
    return "blockquote";
  }

  get schema(): NodeSpec {
    return {
      content: "block*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: [{ tag: "blockquote" }],
      toDOM: () => ["blockquote", 0]
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
    return () => toggleWrap(type, schema.nodes.paragraph);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: NodeSpec;
  }): { [p: string]: CommandFunction } {
    return {
      "Mod->": toggleWrap(type)
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [wrappingInputRule(/^\s*>\s$/, type)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return [
      nodeLinePasteRule(/^\s*>\s(.*)/, type, (match, attrs, childNode) => {
        return type.create(attrs, childNode.cut(2));
      })
    ];
  }
}
