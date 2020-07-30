import { CommandGetter, Node } from "tiptap";
import {
  CommandFunction,
  setBlockType,
  toggleBlockType,
  wrappingInputRule
} from "tiptap-commands";
import { NodeSpec, NodeType, Plugin, Schema } from "@/utils/prosemirror";
import nodeLinePasteRule from "@/utils/nodeLinePasteRule";

export default class Heading extends Node {
  get name() {
    return "heading";
  }

  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6]
    };
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        level: {
          default: 1
        }
      },
      // fix parse
      content: "block*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map((level: number) => ({
        tag: `h${level}`,
        attrs: { level }
      })),
      toDOM: node => [`h${node.attrs.level}`, 0]
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
    return attrs => toggleBlockType(type, schema.nodes.paragraph, attrs);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: NodeSpec;
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
      wrappingInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
        level
      }))
    );
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return this.options.levels.map((level: number) =>
      nodeLinePasteRule(
        new RegExp(`^#{1,${level}}\\s(.*)`),
        type,
        (match, attrs, childNode) => {
          return type.create(attrs, childNode.cut(level + 1));
        },
        () => ({ level })
      )
    );
  }
}
