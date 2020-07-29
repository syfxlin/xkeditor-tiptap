import { Fragment, NodeType, Schema, Slice } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { fragToContent } from "@/utils/tiptap";

export function codePasteRule(type: NodeType, schema: Schema) {
  return new Plugin({
    props: {
      transformPasted: slice => {
        const content = fragToContent(slice.content);
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
