import { Extension } from "tiptap";
import { CommandFunction } from "tiptap-commands";
import { MarkSpec, NodeSpec, Schema, TextSelection } from "@/utils/prosemirror";

export default class ExitMark extends Extension {
  get name() {
    return "exit_mark";
  }

  keys({
    schema
  }: {
    schema: Schema | NodeSpec | MarkSpec;
  }): { [p: string]: CommandFunction } {
    return {
      Delete: (state, dispatch) => {
        const { $cursor } = state.selection as TextSelection;
        if (
          $cursor &&
          $cursor.nodeAfter === null &&
          ($cursor.marks().length > 0 || state.storedMarks)
        ) {
          let tr = state.tr;
          for (const storedMark of [
            ...$cursor.marks(),
            ...(state.storedMarks || [])
          ]) {
            tr = tr.removeStoredMark(storedMark);
          }
          dispatch?.(tr);
          return true;
        }
        return false;
      }
    };
  }
}
