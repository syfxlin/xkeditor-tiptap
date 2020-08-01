import { Fragment, Node, Plugin, Slice } from "@/utils/prosemirror";

export enum Matched {
  CONTAIN_SKIP,
  CONTAIN,
  NOT,
  NOT_SKIP
}

export default function(
  startMatcher: (content: string) => Matched | boolean,
  endMatcher: (content: string) => Matched | boolean,
  matchedCallback: (content: string, node: Node) => Node | null | false,
  startCallback?: (content: string, node: Node, nodes: Node[]) => void,
  endCallback?: (
    content: string | null,
    node: Node | null,
    nodes: Node[]
  ) => void,
  prevCallback?: (fragment: Fragment, nodes: Node[]) => void,
  postCallback?: (fragment: Fragment, nodes: Node[]) => void
) {
  const handler = (fragment: Fragment): Fragment => {
    const nodes: Node[] = [];
    let matched = Matched.NOT;

    if (prevCallback) {
      prevCallback(fragment, nodes);
    }

    fragment.forEach(child => {
      const text = child.textContent;
      if (matched === Matched.NOT) {
        const match = startMatcher(text);
        if (typeof match === "boolean") {
          matched = match ? Matched.CONTAIN : Matched.NOT;
        } else {
          matched = match;
        }
        if (
          startCallback &&
          (matched === Matched.CONTAIN || matched === Matched.CONTAIN_SKIP)
        ) {
          startCallback(text, child, nodes);
        }
      } else {
        const match = endMatcher(text);
        if (typeof match === "boolean") {
          matched = match ? Matched.NOT : Matched.CONTAIN;
        } else {
          matched = match;
        }
        if (
          endCallback &&
          (matched === Matched.NOT_SKIP || matched === Matched.NOT)
        ) {
          endCallback(text, child, nodes);
        }
      }
      if (matched === Matched.CONTAIN) {
        const node = matchedCallback(text, child);
        if (node !== false) {
          if (node !== null) {
            nodes.push(node);
          } else {
            nodes.push(child);
          }
        }
      } else if (matched === Matched.CONTAIN_SKIP) {
        matched = Matched.CONTAIN;
      } else if (matched === Matched.NOT) {
        nodes.push(child);
      } else {
        matched = Matched.NOT;
      }
    });

    if (endCallback && matched !== Matched.NOT) {
      endCallback(null, null, nodes);
    }

    if (postCallback) {
      postCallback(fragment, nodes);
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
