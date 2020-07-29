import {
  Decoration,
  DecorationSet,
  findBlockNodes,
  Node,
  Plugin
} from "@/utils/prosemirror";
import refractor from "refractor";

function getDecorations({ doc, name }: { doc: Node; name: string }) {
  const decorations: Decoration[] = [];
  const blocks = findBlockNodes(doc).filter(
    item => item.node.type.name === name
  );
  const flatten = (list: any) =>
    list.reduce(
      (a: any, b: any) => a.concat(Array.isArray(b) ? flatten(b) : b),
      []
    );

  function parseNodes(nodes: any, className = []) {
    return nodes.map((node: any) => {
      const classes = [
        ...className,
        ...(node.properties && node.properties.className
          ? node.properties.className
          : [])
      ];

      if (node.children) {
        // @ts-ignore
        return parseNodes(node.children, classes);
      }

      return {
        text: node.value,
        classes
      };
    });
  }

  blocks.forEach(block => {
    let startPos = block.pos + 1;
    const nodes = refractor.highlight(
      block.node.textContent,
      block.node.attrs.language || "markup"
    );

    flatten(parseNodes(nodes))
      .map((node: any) => {
        const from = startPos;
        const to = from + node.text.length;

        startPos = to;

        return {
          ...node,
          from,
          to
        };
      })
      .forEach((node: any) => {
        const decoration = Decoration.inline(node.from, node.to, {
          class: node.classes.join(" ")
        });
        decorations.push(decoration);
      });
  });

  return DecorationSet.create(doc, decorations);
}

export default function HighlightPlugin({ name }: { name: string }) {
  return new Plugin({
    state: {
      init: (_, { doc }) => getDecorations({ doc, name }),
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
        if (
          transaction.docChanged &&
          ([oldNodeName, newNodeName].includes(name) ||
            newNodes.length !== oldNodes.length)
        ) {
          return getDecorations({ doc: transaction.doc, name });
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
