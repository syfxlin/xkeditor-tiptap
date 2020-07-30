import { Fragment, Node, NodeType, Plugin, Slice } from "@/utils/prosemirror";

export default function(
  regexp: RegExp,
  type: NodeType,
  getContent:
    | ((
        match: string[],
        attrs: { [attr: string]: any },
        childNode: Node
      ) => string | Node | null)
    | Node
    | string
    | null
    | number = 0,
  getAttrs:
    | ((match: string[], childNode: Node) => { [attr: string]: any })
    | { [attr: string]: any } = {}
) {
  const handler = (fragment: Fragment): Fragment => {
    const nodes: Node[] = [];

    fragment.forEach(child => {
      const text = child.textContent;
      const match = regexp.exec(text);
      if (match) {
        const start = match.index;
        const end = start + match[0].length;

        if (start > 0) {
          nodes.push(child.cut(0, start));
        }

        const childNode = child.cut(start, end);

        const attrs =
          getAttrs instanceof Function ? getAttrs(match, childNode) : getAttrs;
        let content: Node | string | null;
        if (getContent instanceof Function) {
          content = getContent(match, attrs, childNode);
        } else if (typeof getContent === "number") {
          content = match[getContent];
        } else {
          content = getContent;
        }
        if (content === null) {
          content = type.create(attrs);
        }
        if (typeof content === "string") {
          content = type.create(attrs, type.schema.text(content), child.marks);
        }

        nodes.push(content);

        if (end < text.length) {
          nodes.push(child.cut(end));
        }
      } else {
        nodes.push(child);
      }
    });
    return Fragment.fromArray(
      nodes.map(node =>
        node.isInline || node.isText
          ? type.schema.node("paragraph", {}, node)
          : node
      )
    );
  };

  return new Plugin({
    props: {
      transformPasted: slice =>
        new Slice(handler(slice.content), slice.openStart, slice.openEnd)
    }
  });
}
