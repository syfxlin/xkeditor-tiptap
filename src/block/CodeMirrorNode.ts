import { NodeSpec, NodeType, Schema } from "prosemirror-model";
import { CommandGetter, Node } from "tiptap";
import { Command } from "prosemirror-commands";
import { EditorState, Selection } from "prosemirror-state";
import {
  CommandFunction,
  DispatchFn,
  setBlockType,
  textblockTypeInputRule,
  toggleBlockType
} from "tiptap-commands";
import { EditorView } from "prosemirror-view";
import CodeMirrorComponent from "@/block/CodeMirrorComponent.vue";
import { cmRef, dirFocus, isCm } from "@/utils/codemirror";

const arrowHandler = (
  dir: "left" | "right" | "down" | "up" | "backspace" | "delete"
): Command => {
  return (state, dispatch, view) => {
    let eot = dir;
    if (eot === "backspace") {
      eot = "left";
    } else if (eot === "delete") {
      eot = "right";
    }
    if (state.selection.empty && view && view.endOfTextblock(eot)) {
      const side = eot === "left" || eot === "up" ? -1 : 1;
      const $head = state.selection.$head;
      const nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side
      );
      if (isCm(nextPos)) {
        dirFocus(cmRef(nextPos), side);
        return true;
      }
    }
    return false;
  };
};

export default class CodeMirrorNode extends Node {
  get name() {
    return "code_mirror";
  }

  get schema(): NodeSpec {
    return {
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      isolating: true,
      attrs: {
        cmRef: {
          default: undefined
        }
      },
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full"
        }
      ],
      toDOM(node) {
        return ["pre", 0];
      }
    };
  }

  get view() {
    return CodeMirrorComponent;
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: NodeType;
    schema: NodeSpec;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return () => (
      state: EditorState,
      dispatch: DispatchFn | undefined,
      view: EditorView
    ) => {
      const result = toggleBlockType(type, schema.nodes.paragraph)(
        state,
        dispatch,
        view
      );
      // cursorToEnd(cmRef.value);
      return result;
    };
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: NodeSpec;
  }): { [p: string]: CommandFunction } {
    return {
      "Shift-Ctrl-\\": (state, dispatch, view) => {
        const result = setBlockType(type)(state, dispatch);
        // cursorToEnd(cmRef.value);
        return result;
      },
      ArrowLeft: arrowHandler("left"),
      ArrowRight: arrowHandler("right"),
      ArrowUp: arrowHandler("up"),
      ArrowDown: arrowHandler("down"),
      Backspace: arrowHandler("backspace"),
      Delete: arrowHandler("delete")
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [textblockTypeInputRule(/^```$/, type)];
  }
}
