import { NodeSpec, NodeType, Schema } from "prosemirror-model";
import { CommandGetter, Node } from "tiptap";
import CodeMirrorComponent from "@/block/CodeMirrorComponent.vue";
import { Command } from "prosemirror-commands";
import { Selection } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { Editor } from "codemirror";
import {
  CommandFunction,
  setBlockType,
  textblockTypeInputRule,
  toggleBlockType
} from "tiptap-commands";

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
      if (nextPos.$head && nextPos.$head.parent.type.name == "code_mirror") {
        if (cmRef.value) {
          cmRef.value.focus();
          if (side === 1) {
            cmRef.value.setCursor(0);
          } else {
            cmRef.value.setCursor(
              cmRef.value.lastLine(),
              cmRef.value.getLine(cmRef.value.lastLine()).length
            );
          }
          return true;
        }
      }
    }
    return false;
  };
};

const arrowHandlers = keymap({
  ArrowLeft: arrowHandler("left"),
  ArrowRight: arrowHandler("right"),
  ArrowUp: arrowHandler("up"),
  ArrowDown: arrowHandler("down"),
  Backspace: arrowHandler("backspace"),
  Delete: arrowHandler("delete")
});

export const cmRef: { value: null | Editor } = { value: null };

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

  get plugins() {
    return [arrowHandlers];
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
    return () => toggleBlockType(type, schema.nodes.paragraph);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: NodeSpec;
  }): { [p: string]: CommandFunction } {
    return {
      "Shift-Ctrl-\\": setBlockType(type)
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [textblockTypeInputRule(/^```$/, type)];
  }
}
