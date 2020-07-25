import { Editor } from "codemirror";
import { Plugin, Selection } from "prosemirror-state";
import { Fragment, NodeType, Schema, Slice } from "prosemirror-model";

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

export function codePasteRules(type: NodeType, schema: Schema) {
  const getContent = (fragment: Fragment) => {
    let content = "";

    fragment.forEach(child => {
      if (child.isText) {
        content += child.text;
      } else {
        content += getContent(child.content) + "\n";
      }
    });

    return content;
  };

  return new Plugin({
    props: {
      transformPasted: slice => {
        const content = getContent(slice.content);
        const match = content.match(/```([a-zA-Z0-9]*)\n([\w\W]*)\n```\n?/);
        if (match) {
          return new Slice(
            Fragment.from(
              type.create({ language: match[1] }, schema.text(match[2]))
            ),
            slice.openStart,
            slice.openEnd
          );
        }
        return slice;
      }
    }
  });
}
