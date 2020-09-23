import { Ace } from "ace-builds";
import { Command, Node, NodeSpec, Selection } from "@/utils/prosemirror";
import { nextTick } from "vue-demi";
import { CommandFunction } from "tiptap-commands";
import { MdSpec } from "@/marked/MdSpec";
import Editor = Ace.Editor;

export function focus(ace: Editor | undefined | null) {
  if (ace === undefined || ace === null) {
    return;
  }
  ace.focus();
}

export function cursorToStart(ace: Editor | undefined | null) {
  if (ace === undefined || ace === null) {
    return;
  }
  ace.focus();
  ace.moveCursorTo(0, 0);
}

export function cursorToEnd(ace: Editor | undefined | null) {
  if (ace === undefined || ace === null) {
    return;
  }
  ace.focus();
  const row = ace.session.getLength() - 1;
  const col = ace.session.getLine(row).length;
  ace.moveCursorTo(row, col);
}

export function isAce(pos: Selection) {
  return pos.$head && pos.$head.parent.type.spec.ace;
}

export function aceRef(pos: Selection) {
  return pos.$head.parent.attrs.aceRef;
}

export function dirFocus(target: Editor, dir: 1 | -1) {
  if (dir === 1) {
    cursorToStart(target);
  } else {
    cursorToEnd(target);
  }
}

function arrowHandler(
  dir: "left" | "right" | "down" | "up" | "backspace" | "delete",
  ifIn?: (node: Node, dir: 1 | -1) => boolean,
  beforeIn?: (cm: Editor, node: Node, dir: 1 | -1) => void,
  afterIn?: (cm: Editor, node: Node, dir: 1 | -1) => void
): Command {
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
      if (isAce(nextPos) && (!ifIn || ifIn(nextPos.$head.parent, side))) {
        const cm = aceRef(nextPos);
        if (beforeIn) {
          beforeIn(cm, nextPos.$head.parent, side);
        }
        // 在下一个序列中执行防止 focus 失效
        nextTick(() => {
          dirFocus(cm, side);
          if (afterIn) {
            afterIn(cm, nextPos.$head.parent, side);
          }
        });
        return true;
      }
    }
    return false;
  };
}

export function nodeKeys(
  ifIn?: (node: Node, dir: 1 | -1) => boolean,
  beforeIn?: (cm: Editor, node: Node, dir: 1 | -1) => void,
  afterIn?: (cm: Editor, node: Node, dir: 1 | -1) => void
): { [p: string]: CommandFunction } {
  return {
    ArrowLeft: arrowHandler("left", ifIn, beforeIn, afterIn),
    ArrowRight: arrowHandler("right", ifIn, beforeIn, afterIn),
    ArrowUp: arrowHandler("up", ifIn, beforeIn, afterIn),
    ArrowDown: arrowHandler("down", ifIn, beforeIn, afterIn),
    Backspace: arrowHandler("backspace", ifIn, beforeIn, afterIn),
    Delete: arrowHandler("delete", ifIn, beforeIn, afterIn)
  };
}

export function mergeNodeSpec(spec: NodeSpec & MdSpec): NodeSpec {
  spec.attrs = {
    ...spec.attrs,
    aceRef: {
      default: undefined
    }
  };
  return {
    content: "text*",
    group: "block",
    code: true,
    defining: true,
    isolating: true,
    ace: true,
    ...spec
  };
}
