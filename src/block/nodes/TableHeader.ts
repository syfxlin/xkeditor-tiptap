import { Node } from "tiptap";
import TableNodes from "@/block/other/TableNodes";
import { NodeSpec } from "@/utils/prosemirror";
import { MdSpec } from "@/block/other/MdSpec";

export default class TableHeader extends Node {
  get name() {
    return "table_header";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      ...TableNodes.table_header,
      toMarkdown: (node, serializer) => serializer(node.content)
    };
  }
}
