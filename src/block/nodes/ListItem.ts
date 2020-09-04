import { Node } from "tiptap";
import { liftListItem, sinkListItem, splitListItem } from "tiptap-commands";
import { NodeSpec, Schema } from "@/utils/prosemirror";
import { NodeType } from "prosemirror-model";
import { MdSpec } from "@/block/other/MdSpec";
import { Token } from "marked";

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
          getContent: (token, s, parser) => {
            if (!("tokens" in token)) {
              return undefined;
            }
            const nodes = parser(token.tokens as Token[]);
            const first = nodes[0];
            if (first && first.isText) {
              nodes.shift();
              nodes.unshift(s.node("paragraph", undefined, first));
            }
            return nodes;
          }
        }
      ]
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
