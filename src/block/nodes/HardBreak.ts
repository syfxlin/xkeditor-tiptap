import { Node } from "tiptap";
import { chainCommands, CommandFunction, exitCode } from "tiptap-commands";
import { NodeSpec, NodeType, Schema } from "@/utils/prosemirror";

export default class HardBreak extends Node {
  get name() {
    return "hard_break";
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM: () => ["br"]
    };
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: Schema;
  }): { [p: string]: CommandFunction } {
    const command = chainCommands(exitCode, (state, dispatch) => {
      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
        return true;
      } else {
        return false;
      }
    });
    return {
      "Mod-Enter": command,
      "Shift-Enter": command
    };
  }
}
