import { Node } from "tiptap";
import { liftListItem, sinkListItem, splitListItem } from "tiptap-commands";
import { NodeSpec, Schema } from "@/utils/prosemirror";
import { NodeType } from "prosemirror-model";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";

export default class ListItem extends Node {
  get name() {
    return "list_item";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      content: "paragraph block*",
      defining: true,
      draggable: false,
      parseDOM: [{ tag: "li" }],
      toDOM: () => ["li", 0],
      parseMarkdown: [
        {
          type: "list_item",
          matcher: token => !(token as Tokens.ListItem).task,
          getContent: (token, parser) => {
            const nodes = parser.parse((token as Tokens.ListItem).tokens);
            const first = nodes[0];
            if (first && first.isText) {
              nodes.shift();
              nodes.unshift(parser.schema.node("paragraph", undefined, first));
            }
            return nodes;
          }
        }
      ],
      toMarkdown: (node, serializer) => serializer.serialize(node.content)
    };
  }

  keys({ type, schema }: { type: NodeType; schema: Schema }) {
    return {
      Enter: splitListItem(type),
      Tab: sinkListItem(type),
      "Shift-Tab": liftListItem(type)
    };
  }
}
