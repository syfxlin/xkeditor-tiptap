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

export default class OrderedList extends Node {
  get name() {
    return "ordered_list";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      attrs: {
        order: {
          default: 1
        }
      },
      content: "list_item+",
      group: "block",
      parseDOM: [
        {
          tag: "ol",
          getAttrs: node => {
            const dom = node as HTMLElement;
            const order = dom.getAttribute("start") || "1";
            return {
              order: +order
            };
          }
        }
      ],
      toDOM: node =>
        node.attrs.order === 1
          ? ["ol", 0]
          : ["ol", { start: node.attrs.order }, 0],
      parseMarkdown: [
        {
          type: "list",
          matcher: t => {
            const token = t as Tokens.List;
            if (token.items.length === 0 || !token.items[0].task) {
              return token.ordered;
            }
            return false;
          },
          getContent: (token, s, parser) => parser((token as Tokens.List).items)
        }
      ],
      toMarkdown: (node, serializer) => {
        let index = 1;
        return serializer(node.content)
          .split(/\n+/)
          .map(
            str => (/(\s*\d+\. )/.test(str) ? " " : index++ + ".") + " " + str
          )
          .join("\n");
      }
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
      "Shift-Ctrl-9": toggleList(type, schema.nodes.list_item)
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        type,
        match => ({ order: +match[1] }),
        (match, node) => node.childCount + node.attrs.order === +match[1]
      )
    ];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return listPlugin(/^\s*(\d+)\.\s/, /(\d+)\.\s/, type, schema);
  }
}
