import { CommandGetter, Node } from "tiptap";
import {
  CommandFunction,
  setBlockType,
  textblockTypeInputRule,
  toggleBlockType
} from "tiptap-commands";
import { NodeSpec, NodeType, Plugin, Schema } from "@/utils/prosemirror";
import nodeLinePasteRule from "@/utils/nodeLinePasteRule";
import { MdSpec } from "@/block/other/MdSpec";
import { Token, Tokens } from "marked";

export default class Heading extends Node {
  get name() {
    return "heading";
  }

  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6]
    };
  }

  get schema(): NodeSpec & MdSpec {
    return {
      attrs: {
        level: {
          default: 1
        }
      },
      content: "inline*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map((level: number) => ({
        tag: `h${level}`,
        attrs: { level }
      })),
      toDOM: node => [
        `h${node.attrs.level}`,
        { id: encodeURI(node.textContent) },
        0
      ],
      parseMarkdown: [
        {
          type: "heading",
          getAttrs: token => ({
            level: (token as Tokens.Heading).depth
          }),
          getContent: (token, s, parser) => {
            return "tokens" in token
              ? parser(token.tokens as Token[])
              : undefined;
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
    return attrs => toggleBlockType(type, schema.nodes.paragraph, attrs);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: Schema;
  }): { [p: string]: CommandFunction } {
    return this.options.levels.reduce(
      (items: number[], level: number) => ({
        ...items,
        ...{
          [`Shift-Ctrl-${level}`]: setBlockType(type, { level })
        }
      }),
      {}
    );
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return this.options.levels.map((level: number) =>
      textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
        level
      }))
    );
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return this.options.levels.map((level: number) =>
      nodeLinePasteRule(new RegExp(`^#{1,${level}}\\s(.*)`), type, 1, () => ({
        level
      }))
    );
  }
}
