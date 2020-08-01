import { Editor } from "codemirror";
import { Command, Node, Selection } from "@/utils/prosemirror";
import { CommandFunction } from "tiptap-commands";
import { nextTick } from "vue-demi";

export function focus(cm: Editor | undefined | null) {
  if (cm === undefined || cm === null) {
    return;
  }
  cm.focus();
}

export function cursorToStart(cm: Editor | undefined | null) {
  if (cm === undefined || cm === null) {
    return;
  }
  cm.focus();
  cm.setCursor(0);
}

export function cursorToEnd(cm: Editor | undefined | null) {
  if (cm === undefined || cm === null) {
    return;
  }
  cm.focus();
  cm.setCursor(cm.lastLine(), cm.getLine(cm.lastLine()).length);
}

export function isCm(pos: Selection) {
  return pos.$head && pos.$head.parent.type.spec.cm;
}

export function cmRef(pos: Selection) {
  return pos.$head.parent.attrs.cmRef;
}

export function dirFocus(target: Editor, dir: 1 | -1) {
  if (dir === 1) {
    cursorToStart(target);
  } else {
    cursorToEnd(target);
  }
}

const arrowHandler = (
  dir: "left" | "right" | "down" | "up" | "backspace" | "delete",
  ifIn?: (node: Node, dir: 1 | -1) => boolean,
  beforeIn?: (cm: Editor, node: Node, dir: 1 | -1) => void,
  afterIn?: (cm: Editor, node: Node, dir: 1 | -1) => void
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
      if (isCm(nextPos) && (!ifIn || ifIn(nextPos.$head.parent, side))) {
        const cm = cmRef(nextPos);
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
};

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
