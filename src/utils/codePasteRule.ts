import {Fragment, NodeType, Schema, Slice} from "prosemirror-model";
import {Plugin} from "prosemirror-state";

export function codePasteRule(type: NodeType, schema: Schema) {
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
              type.create({language: match[1]}, schema.text(match[2]))
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