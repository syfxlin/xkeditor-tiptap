import { CommandGetter, Node } from "tiptap";
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnResizing,
  createTable,
  deleteColumn,
  deleteRow,
  deleteTable,
  EditorState,
  fixTables,
  goToNextCell,
  mergeCells,
  Node as ProsemirrorNode,
  NodeSpec,
  NodeType,
  Plugin,
  Schema,
  setCellAttr,
  splitCell,
  tableEditing,
  TextSelection,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow
} from "@/utils/prosemirror";
import TableNodes from "@/block/other/TableNodes";
import { DispatchFn, wrappingInputRule } from "tiptap-commands";
import nodeListPasteRule from "@/utils/nodeListPasteRule";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";

export default class Table extends Node {
  get name() {
    return "table";
  }

  get defaultOptions() {
    return {
      resizable: false
    };
  }

  get schema(): NodeSpec & MdSpec {
    return {
      ...TableNodes.table,
      parseMarkdown: [
        {
          type: "table",
          getContent: (t, parser) => {
            const token = t as Tokens.Table;
            const schema = parser.schema;
            const header = schema.node(
              "table_row",
              undefined,
              token.header.map(h =>
                schema.node("table_header", undefined, parser.parse(h))
              )
            );
            const cells = token.cells.map(row =>
              schema.node(
                "table_row",
                undefined,
                row.map(cell =>
                  schema.node("table_cell", undefined, parser.parse(cell))
                )
              )
            );
            return [header, ...cells];
          }
        }
      ],
      toMarkdown: (node, serializer) => {
        const nodes: string[] = [];
        node.content.forEach(item => nodes.push(serializer.serialize(item)));
        nodes.splice(1, 0, nodes[0].replace(/[^|]+/g, "---"));
        return nodes.join("\n");
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
    return {
      createTable: ({ rowsCount, colsCount, withHeaderRow }) => (
        state: EditorState,
        dispatch: DispatchFn | undefined
      ) => {
        const offset = state.tr.selection.anchor + 1;

        const nodes = createTable(schema, rowsCount, colsCount, withHeaderRow);
        const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView();
        const resolvedPos = tr.doc.resolve(offset);

        tr.setSelection(TextSelection.near(resolvedPos));
        if (dispatch) {
          return dispatch(tr);
        }
        return false;
      },
      addColumnBefore: () => addColumnBefore,
      addColumnAfter: () => addColumnAfter,
      deleteColumn: () => deleteColumn,
      addRowBefore: () => addRowBefore,
      addRowAfter: () => addRowAfter,
      deleteRow: () => deleteRow,
      deleteTable: () => deleteTable,
      toggleCellMerge: () => (
        state: EditorState,
        dispatch: DispatchFn | undefined
      ) => {
        if (mergeCells(state, dispatch)) {
          return true;
        }
        return splitCell(state, dispatch);
      },
      mergeCells: () => mergeCells,
      splitCell: () => splitCell,
      toggleHeaderColumn: () => toggleHeaderColumn,
      toggleHeaderRow: () => toggleHeaderRow,
      toggleHeaderCell: () => toggleHeaderCell,
      setCellAttr: () => setCellAttr,
      // @ts-ignore
      fixTables: () => fixTables
    };
  }

  keys() {
    return {
      Tab: goToNextCell(1),
      "Shift-Tab": goToNextCell(-1)
    };
  }

  get plugins() {
    return [
      ...(this.options.resizable ? [columnResizing({})] : []),
      tableEditing()
    ];
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [wrappingInputRule(/^\|\|\|$/, type)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    let rows: { content: string; node: ProsemirrorNode }[] = [];
    const createRow = (
      columns: string[],
      node: ProsemirrorNode,
      isHeader = false
    ) => {
      let pos = 0;
      return schema.node(
        "table_row",
        {},
        columns.map(item => {
          const match = item.match(/(\s*)(.*?)\s*$/);
          let result;
          if (match && match.index !== undefined) {
            const start = pos + match.index + match[1].length + 1;
            result = schema.node(
              isHeader ? "table_header" : "table_cell",
              {},
              node.cut(start, start + match[2].length)
            );
          } else {
            result = schema.node(
              isHeader ? "table_header" : "table_cell",
              {},
              schema.text(item.trim())
            );
          }
          pos += item.length + 1;
          return result;
        })
      );
    };
    return [
      nodeListPasteRule(
        content => /^\|.+\|$/.test(content),
        content => !/^\|.+\|$/.test(content),
        (content, node) => {
          rows.push({ content, node });
          return false;
        },
        undefined,
        (content, node, nodes) => {
          let hasHeader: 0 | 1 | 2 = 0;
          let rowNodes: ProsemirrorNode[] = [];
          for (let i = rows.length - 1; i >= 0; i--) {
            // 修复多表格连接的问题
            if (hasHeader === 2) {
              hasHeader = 0;
              nodes.push(type.create({}, rowNodes));
              rowNodes = [];
            }
            const row = rows[i];
            const columns = row.content
              .split("|")
              .slice(1, -1)
              .filter(item => !/^[-:\s]+$/.test(item));
            if (columns.length === 0) {
              hasHeader = 1;
              continue;
            }
            rowNodes.unshift(createRow(columns, row.node, hasHeader === 1));
            if (hasHeader === 1) {
              hasHeader = 2;
            }
          }
          nodes.push(type.create({}, rowNodes));
          rows = [];
        }
      )
    ];
  }
}
