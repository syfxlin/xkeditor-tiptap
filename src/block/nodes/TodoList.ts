import { CommandGetter, Node } from "tiptap";
import { toggleList, wrappingInputRule } from "tiptap-commands";
import { NodeSpec, NodeType, Plugin, Schema } from "@/utils/prosemirror";
import listPlugin from "@/utils/listPlugin";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";

export default class TodoList extends Node {
  get name() {
    return "todo_list";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      group: "block",
      content: "todo_item+",
      toDOM: () => ["ul", { "data-type": this.name }, 0],
      parseDOM: [
        {
          priority: 51,
          tag: `[data-type="${this.name}"]`
        }
      ],
      parseMarkdown: [
        {
          type: "list",
          matcher: t => {
            const token = t as Tokens.List;
            return token.items.length !== 0 && token.items[0].task;
          },
          getContent: (token, s, parser) => parser((token as Tokens.List).items)
        }
      ],
      toMarkdown: (node, serializer) =>
        serializer(node.content)
          .split(/\n+/)
          .map(str => (/\s*- /.test(str) ? " " : "-") + " " + str)
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
    return () => toggleList(type, schema.nodes.todo_item);
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [wrappingInputRule(/^\s*(\[ \])\s$/, type)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return listPlugin(
      /^\s*(- )?\[([-+*xX ])\]\s/,
      /\[[-+*xX ]\]\s/,
      type,
      schema,
      {
        name: "todo_item",
        ceil: 2,
        cut: 3
      },
      (content, node) => {
        const match = content.match(/^\s*(- )?\[([-+*xX ])\]\s/);
        if (match) {
          return {
            done: match[2] !== " "
          };
        }
      }
    );
  }
}
