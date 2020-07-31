import { Fragment, Node, NodeType, Plugin, Slice } from "@/utils/prosemirror";

export function nodePasteRule(
  startRegExp: RegExp,
  endRegExp: RegExp,
  type: NodeType,
  getContent:
    | ((
        content: string,
        startMatch: string[],
        endMatch: string[],
        attrs: { [attr: string]: any },
        childNodes: Node[]
      ) => string | Node | null)
    | string
    | null
    | number = 0,
  getAttrs:
    | ((
        content: string,
        startMatch: string[],
        endMatch: string[],
        childNodes: Node[]
      ) => { [attr: string]: any })
    | { [attr: string]: any } = {}
) {
  const handler = (fragment: Fragment): Fragment => {
    let fragContent: string | null = null;
    let startMatch: string[];
    const childNodes: Node[] = [];
    const nodes: Node[] = [];

    fragment.forEach(child => {
      const text = child.textContent;
      if (fragContent === null) {
        const match = startRegExp.exec(text);
        if (match) {
          startMatch = match;
          fragContent = text.substring(match.index);
          childNodes.push(child.cut(match.index));

          if (match.index > 0) {
            nodes.push(child.cut(0, match.index));
          }
        } else {
          nodes.push(child);
        }
      } else {
        const match = endRegExp.exec(text);
        if (match) {
          const endIndex = match.index + match[0].length;
          fragContent += "\n" + text.substring(0, endIndex);
          childNodes.push(child.cut(0, endIndex));

          const attrs =
            getAttrs instanceof Function
              ? getAttrs(fragContent, startMatch, match, childNodes)
              : getAttrs;
          let content: Node | string | undefined | null;
          if (getContent instanceof Function) {
            content = getContent(
              fragContent,
              startMatch,
              match,
              attrs,
              childNodes
            );
          } else if (typeof getContent === "string") {
            content = getContent;
          } else if (typeof getContent === "number") {
            content = match[getContent];
          } else {
            content = getContent;
          }
          if (content === null) {
            content = type.create(attrs);
          }
          if (typeof content === "string") {
            content = type.create(
              attrs,
              type.schema.text(content),
              child.marks
            );
          }

          // @ts-ignore
          nodes.push(content);

          nodes.push(child.cut(endIndex));

          fragContent = null;
        } else {
          fragContent += "\n" + text;
          childNodes.push(child);
        }
      }
    });

    if (fragContent !== null) {
      nodes.push(...childNodes);
    }

    return Fragment.fromArray(
      nodes.map(node =>
        node.isInline || node.isText
          ? type.schema.node("paragraph", null, node)
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
