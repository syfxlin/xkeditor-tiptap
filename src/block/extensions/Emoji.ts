import { Extension } from "tiptap";
import {
  Fragment,
  InputRule,
  Node,
  Plugin,
  Schema,
  Slice
} from "@/utils/prosemirror";
import { EmojiConvertor } from "emoji-js";

const emojiConverter = new EmojiConvertor();
// eslint-disable-next-line
emojiConverter.replace_mode = "unified";

export function convertEmoji(code: string): string {
  return emojiConverter.replace_colons(code);
}

export default class Emoji extends Extension {
  get name() {
    return "emoji";
  }

  inputRules({ schema }: { schema: Schema }): any[] {
    return [
      new InputRule(/(:[a-zA-Z0-9]+:)/, (state, match, start, end) => {
        const { tr, schema } = state;
        tr.replaceWith(start, end, schema.text(convertEmoji(match[1])));
        return tr;
      })
    ];
  }

  pasteRules({ schema }: { schema: Schema }): Plugin[] {
    const regexp = new RegExp(/(:[a-zA-Z0-9]+:)/);
    const handler = (fragment: Fragment) => {
      const nodes: Node[] = [];

      fragment.forEach(child => {
        if (child.isText) {
          const { text } = child;
          let pos = 0;
          let match;

          while (text && (match = regexp.exec(text.substring(pos))) !== null) {
            if (match.length > 1) {
              const start = match.index;
              const end = start + match[0].length;

              // adding text before markdown to nodes
              if (start > 0) {
                nodes.push(child.cut(pos, start));
              }

              // adding the markdown part to nodes
              child.cut(start, end);
              nodes.push(schema.text(convertEmoji(match[1]), child.marks));

              pos = end;
            }
          }

          // adding rest of text to nodes
          if (text && pos < text.length) {
            nodes.push(child.cut(pos));
          }
        } else {
          nodes.push(child.copy(handler(child.content)));
        }
      });

      return Fragment.fromArray(nodes);
    };

    return [
      new Plugin({
        props: {
          transformPasted: slice =>
            new Slice(handler(slice.content), slice.openStart, slice.openEnd)
        }
      })
    ];
  }
}
