import { Fragment, Node, NodeType, Plugin, Slice } from "@/utils/prosemirror";

export default function(
  regexp: RegExp,
  type: NodeType,
  getContent:
    | ((
        match: RegExpExecArray,
        attrs: { [attr: string]: any },
        childNode: Node
      ) => string | Node | null)
    | Node
    | string
    | null
    | number = 0,
  getAttrs:
    | ((match: RegExpExecArray, childNode: Node) => { [attr: string]: any })
    | { [attr: string]: any } = {}
) {
  regexp = new RegExp(regexp, "g");

  const cutChild = (node: Node, start: number, end?: number): Node => {
    node = node.cut(start, end);
    if (node.isInline || node.isText || node.textContent === "") {
      return node;
    }
    return type.schema.text(node.textContent);
  };

  const handler = (fragment: Fragment): Fragment => {
    const nodes: Node[] = [];

    fragment.forEach(child => {
      let hasMatch = false;
      const text = child.textContent;
      let match;
      let pos = 0;

      const inlineNodes = [];

      while ((match = regexp.exec(text))) {
        hasMatch = true;
        const start = match.index;
        const end = start + match[0].length;

        if (pos < start) {
          inlineNodes.push(cutChild(child, pos, start));
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

        inlineNodes.push(content);

        pos = end;
      }
      if (pos < text.length) {
        inlineNodes.push(cutChild(child, pos));
      }
      if (!hasMatch) {
        nodes.push(child);
      } else {
        nodes.push(type.schema.node("paragraph", {}, inlineNodes));
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
