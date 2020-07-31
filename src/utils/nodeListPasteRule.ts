import { Fragment, Node, Plugin, Slice } from "@/utils/prosemirror";

export default function(
  startMatcher: (content: string) => boolean,
  endMatcher: (content: string) => boolean,
  matchedCallback: (content: string, node: Node) => Node | null | false,
  startCallback?: (content: string, node: Node, nodes: Node[]) => void,
  endCallback?: (
    content: string | null,
    node: Node | null,
    nodes: Node[]
  ) => void
) {
  const handler = (fragment: Fragment): Fragment => {
    const nodes: Node[] = [];
    let matched = false;

    fragment.forEach(child => {
      const text = child.textContent;
      if (!matched) {
        matched = startMatcher(text);
        if (startCallback) {
          startCallback(text, child, nodes);
        }
      } else {
        matched = !endMatcher(text);
        if (endCallback && !matched) {
          endCallback(text, child, nodes);
        }
      }
      if (matched) {
        const node = matchedCallback(text, child);
        if (node !== false) {
          if (node !== null) {
            nodes.push(node);
          } else {
            nodes.push(child);
          }
        }
      } else {
        nodes.push(child);
      }
    });

    if (endCallback && matched) {
      endCallback(null, null, nodes);
    }

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    props: {
      transformPasted: slice =>
        new Slice(handler(slice.content), slice.openStart, slice.openEnd)
    }
  });
}
