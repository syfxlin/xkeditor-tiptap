import { Editor } from "codemirror";
import { Selection } from "prosemirror-state";

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
  return pos.$head && pos.$head.parent.type.name == "code_mirror";
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
