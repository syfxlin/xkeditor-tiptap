import { CommandGetter, Node } from "tiptap";
import {
  CommandFunction,
  toggleWrap,
  wrappingInputRule
} from "tiptap-commands";
import { NodeSpec, NodeType, Plugin, Schema } from "@/utils/prosemirror";
import nodeLinePasteRule from "@/utils/nodeLinePasteRule";
import { MdSpec } from "@/block/other/MdSpec";
import { Tokens } from "@/block/other/MarkdownLexer";

export default class Blockquote extends Node {
  get name() {
    return "blockquote";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      content: "block*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: [{ tag: "blockquote" }],
      toDOM: () => ["blockquote", 0],
      parseMarkdown: [
        {
          type: "blockquote",
          getContent: (token, s, parser) =>
            parser((token as Tokens.Blockquote).tokens)
        }
      ],
      toMarkdown: (node, serializer) =>
        serializer(node.content)
          .split("\n")
          .map(str => "> " + str)
          .join("\n")
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
    return () => toggleWrap(type, schema.nodes.paragraph);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: Schema;
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
