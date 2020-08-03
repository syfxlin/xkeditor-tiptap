import { Decoration, findBlockNodes, Node, Plugin } from "@/utils/prosemirror";
import { ref } from "@vue/composition-api";
import { DecorationSet } from "prosemirror-view";

type Head = {
  head: Node;
  sub: Head[];
};

export const toc = ref<Head[]>();

function generateToc({ doc, name }: { doc: Node; name: string }) {
  const decorations: Decoration[] = [];

  const blocks = findBlockNodes(doc).filter(
    item => item.node.type.name === name
  );

  const headerNodes = findBlockNodes(doc).filter(
    item => item.node.type.name === "heading"
  );
  const makeHeaders = (index: { value: number }) => {
    const sub: Head[] = [];
    // if next > curr => make
    // if next < curr => return
    // if next == curr => sub.push
    while (index.value < headerNodes.length) {
      const curr = headerNodes[index.value++];
      const next =
        index.value < headerNodes.length ? headerNodes[index.value] : curr;
      const currLevel = curr.node.attrs.level;
      const nextLevel = next.node.attrs.level;
      if (nextLevel === currLevel) {
        sub.push({
          head: curr.node,
          sub: []
        });
      } else if (nextLevel > currLevel) {
        sub.push({
          head: curr.node,
          sub: makeHeaders(index)
        });
      } else {
        sub.push({
          head: curr.node,
          sub: []
        });
        return sub;
      }
    }
    return sub;
  };
  toc.value = makeHeaders({ value: 0 });
}

export default function TocPlugin() {
  const name = "heading";
  return new Plugin({
    state: {
      init: (_, { doc }) => {
        generateToc({ doc, name });
        return DecorationSet.empty;
      },
      apply: (transaction, decorationSet, oldState, newState) => {
        // TODO: find way to cache decorations
        // https://discuss.prosemirror.net/t/how-to-update-multiple-inline-decorations-on-node-change/1493
        const oldNodeName = oldState.selection.$head.parent.type.name;
        const newNodeName = newState.selection.$head.parent.type.name;
        const oldNodes = findBlockNodes(oldState.doc).filter(
          item => item.node.type.name === name
        );
        const newNodes = findBlockNodes(newState.doc).filter(
          item => item.node.type.name === name
        );
        // Apply decorations if selection includes named node, or transaction changes named node.
        if (transaction.docChanged) {
          if (
            [oldNodeName, newNodeName].includes(name) ||
            newNodes.length !== oldNodes.length
          ) {
            generateToc({ doc: transaction.doc, name });
          } else {
            for (let i = 0; i < oldNodes.length; i++) {
              if (
                oldNodes[i].node.textContent !== newNodes[i].node.textContent
              ) {
                generateToc({ doc: transaction.doc, name });
                break;
              }
            }
          }
        }
        return decorationSet.map(transaction.mapping, transaction.doc);
      }
    },
    props: {
      decorations(state) {
        return this.getState(state);
      }
    }
  });
}
