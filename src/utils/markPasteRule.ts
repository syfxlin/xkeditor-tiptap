import { Fragment, MarkType, Node, Plugin, Slice } from "@/utils/prosemirror";

export default function(
  regexp: RegExp,
  type: MarkType,
  getContent: ((match: string[]) => string) | string | number = 1,
  getAttrs:
    | ((match: string[]) => { [attr: string]: any })
    | { [attr: string]: any } = {}
) {
  const handler = (
    fragment: Fragment,
    parent: Node | undefined = undefined
  ) => {
    const nodes: Node[] = [];

    fragment.forEach(child => {
      if (child.isText) {
        const { text, marks } = child;
        let pos = 0;
        let match;

        const isLink = !!marks.filter(x => x.type.name === "link")[0];

        // eslint-disable-next-line
        while (
          !isLink &&
          text &&
          (match = regexp.exec(text.substring(pos))) !== null
        ) {
          if (parent && parent.type.allowsMarkType(type) && match.length > 1) {
            const attrs =
              getAttrs instanceof Function ? getAttrs(match) : getAttrs;
            let content;
            if (getContent instanceof Function) {
              content = getContent(match);
            } else if (typeof getContent === "string") {
              content = getContent;
            } else {
              content = match[getContent];
            }
            const start = match.index;
            const end = start + match[0].length;
            const textStart = start + match[0].indexOf(content);
            const textEnd = textStart + content.length;

            // adding text before markdown to nodes
            if (start > 0) {
              nodes.push(child.cut(pos, start));
            }

            // adding the markdown part to nodes
            nodes.push(
              child
                .cut(textStart, textEnd)
                .mark(type.create(attrs).addToSet(child.marks))
            );

            pos = end;
          }
        }

        // adding rest of text to nodes
        if (text && pos < text.length) {
          nodes.push(child.cut(pos));
        }
      } else {
        nodes.push(child.copy(handler(child.content, child)));
      }
    });

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    props: {
      transformPasted: slice =>
        new Slice(handler(slice.content), slice.openStart, slice.openEnd)
    }
  });
}
