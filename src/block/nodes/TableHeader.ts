import { Node } from "tiptap";
import TableNodes from "@/block/other/TableNodes";

export default class TableHeader extends Node {
  get name() {
    return "table_header";
  }

  get schema() {
    return TableNodes.table_header;
  }
}
