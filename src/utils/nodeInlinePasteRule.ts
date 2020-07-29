import { Fragment, Node, NodeType, Plugin, Slice } from "@/utils/prosemirror";

export default function(
  regexp: RegExp,
  type: NodeType,
  getContent: ((match: string[]) => string) | string | number = 0,
  getAttrs:
    | ((match: string[]) => { [attr: string]: any })
    | { [attr: string]: any } = {}
) {
  const handler = (
    fragment: Fragment
  ): { changed: boolean; fragment: Fragment } => {
    const nodes: Node[] = [];
    let changed = false;

    fragment.forEach(child => {
      if (child.isText) {
        const { text } = child;
        const match = regexp.exec(text || "");
        let pos = 0;
        if (match) {
          const start = match.index;
          const end = start + match[0].length;
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

          if (start > 0) {
            nodes.push(child.cut(pos, start));
          }

          child.cut(start, end);
          nodes.push(
            type.create(attrs, type.schema.text(content), child.marks)
          );

          pos = end;
          changed = true;
        }

        if (text && pos < text.length) {
          nodes.push(child.cut(pos));
        }
      } else {
        const result = handler(child.content);
        if (result.changed) {
          result.fragment.forEach(node => nodes.push(node));
        } else {
          nodes.push(child.copy(result.fragment));
        }
      }
    });

    return {
      changed,
      fragment: Fragment.fromArray(nodes)
    };
  };

  return new Plugin({
    props: {
      transformPasted: slice =>
        new Slice(
          handler(slice.content).fragment,
          slice.openStart,
          slice.openEnd
        )
    }
  });
}
