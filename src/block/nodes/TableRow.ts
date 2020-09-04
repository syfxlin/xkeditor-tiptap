import { Node } from "tiptap";
import TableNodes from "@/block/other/TableNodes";

export default class TableRow extends Node {
  get name() {
    return "table_row";
  }

  get schema() {
    return TableNodes.table_row;
  }
}
