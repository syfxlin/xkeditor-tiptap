import { Node as ProsemirrorNode, NodeType, Schema } from "@/utils/prosemirror";
import nodeListPasteRule from "@/utils/nodeListPasteRule";

export default function(
  r1: RegExp,
  r2: RegExp,
  type: NodeType,
  schema: Schema
) {
  let lists:
    | {
        node: ProsemirrorNode;
        level: number;
      }[]
    | undefined;

  const makeList = (
    lists: { node: ProsemirrorNode; level: number }[],
    index: { value: number }
  ): ProsemirrorNode => {
    const nodes: ProsemirrorNode[] = [];
    while (index.value < lists.length) {
      const current = lists[index.value++];
      const next = index.value >= lists.length ? current : lists[index.value];
      if (current.level < next.level) {
        nodes.push(
          schema.node("list_item", {}, [current.node, makeList(lists, index)])
        );
      } else if (current.level === next.level) {
        nodes.push(schema.node("list_item", {}, current.node));
      } else {
        nodes.push(schema.node("list_item", {}, current.node));
        return type.create({}, nodes);
      }
    }
    return type.create({}, nodes);
  };

  return [
    nodeListPasteRule(
      content => r1.test(content),
      content => !r1.test(content),
      (content, node) => {
        const index = content.search(r2);
        lists?.push({
          level: Math.ceil(index / 2),
          node: node.cut(index + 2)
        });
        return false;
      },
      () => {
        lists = [];
      },
      (content, node, nodes) => {
        // @ts-ignore
        nodes.push(makeList(lists, { value: 0 }, -1));
        lists = undefined;
      }
    )
  ];
}
