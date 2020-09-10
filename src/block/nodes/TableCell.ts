import { Node } from "tiptap";
import TableNodes from "@/block/other/TableNodes";
import { NodeSpec } from "@/utils/prosemirror";
import { MdSpec } from "@/block/other/MdSpec";

export default class TableCell extends Node {
  get name() {
    return "table_cell";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      ...TableNodes.table_cell,
      toMarkdown: (node, serializer) => {
        const nodes: string[] = [];
        node.content.forEach(item => {
          let content = serializer(item);
          if (item.type.name === "table") {
            content = " :" + JSON.stringify(content);
          }
          nodes.push(content);
        });
        return nodes.join("");
      }
    };
  }
}
