import { CommandGetter, Node } from "tiptap";
import { CommandFunction, nodeInputRule } from "tiptap-commands";
import { NodeSpec, NodeType, Plugin, Schema } from "@/utils/prosemirror";
import nodeLinePasteRule from "@/utils/nodeLinePasteRule";
import { MdSpec } from "@/block/other/MdSpec";

export default class HorizontalRule extends Node {
  get name() {
    return "horizontal_rule";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM: () => ["hr"],
      parseMarkdown: [
        {
          type: "hr"
        }
      ]
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
    const command: CommandFunction = (state, dispatch) => {
      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(type.create()));
        return true;
      }
      return false;
    };
    return () => command;
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [nodeInputRule(/^(?:---|___\s|\*\*\*\s)$/, type)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return [nodeLinePasteRule(/^(?:---|___\s|\*\*\*\s)$/, type, null)];
  }
}
