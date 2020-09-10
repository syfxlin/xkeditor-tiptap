import { Node } from "tiptap";
import TableNodes from "@/block/other/TableNodes";
import { NodeSpec } from "@/utils/prosemirror";
import { MdSpec } from "@/block/other/MdSpec";

export default class TableRow extends Node {
  get name() {
    return "table_row";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      ...TableNodes.table_row,
      toMarkdown: (node, serializer) => {
        const nodes: string[] = [];
        node.content.forEach(item => nodes.push(serializer(item)));
        return "| " + nodes.join(" | ") + " |";
      }
    };
  }
}
