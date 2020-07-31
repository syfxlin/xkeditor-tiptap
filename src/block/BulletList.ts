import { CommandGetter, Node } from "tiptap";
import {
  CommandFunction,
  toggleList,
  wrappingInputRule
} from "tiptap-commands";
import {
  Node as ProsemirrorNode,
  NodeSpec,
  NodeType,
  Plugin,
  Schema
} from "@/utils/prosemirror";
import nodeListPasteRule from "@/utils/nodeListPasteRule";

export default class BulletList extends Node {
  get name() {
    return "bullet_list";
  }

  get schema(): NodeSpec {
    return {
      content: "list_item+",
      group: "block",
      parseDOM: [{ tag: "ul" }],
      toDOM: () => ["ul", 0]
    };
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: NodeType;
    schema: NodeSpec;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return () => toggleList(type, schema.nodes.list_item);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: NodeSpec;
  }): { [p: string]: CommandFunction } {
    return {
      "Shift-Ctrl-8": toggleList(type, schema.nodes.list_item)
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [wrappingInputRule(/^\s*([-+*])\s$/, type)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
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
        content => /^\s*([-+*])\s/.test(content),
        content => !/^\s*([-+*])\s/.test(content),
        (content, node) => {
          const index = content.search(/[-+*]/);
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
}
