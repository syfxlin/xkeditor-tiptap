import {
  Fragment,
  Mark,
  MarkType,
  Node,
  NodeType,
  Schema
} from "@/utils/prosemirror";
import { MdSpec } from "@/block/other/MdSpec";

export type MdSerializerRule = (
  node: Node,
  serializer: (nodes: Fragment | Node[] | Node) => string
) => string | ((content: string, mark: Mark) => string);

export class MarkdownSerializer {
  private readonly schema: Schema;
  private readonly blocks: {
    [tokenType: string]: {
      serializer: MdSerializerRule;
      block: MarkType | NodeType;
    };
  };

  constructor(schema: Schema) {
    this.schema = schema;
    this.blocks = {};
    for (const block of [
      ...Object.values(schema.marks),
      ...Object.values(schema.nodes)
    ]) {
      const serializer = (block.spec as MdSpec).toMarkdown;
      if (serializer) {
        this.blocks[block.name] = {
          serializer,
          block
        };
      }
    }
  }

  serializeMark(content: string, node: Node): string {
    for (const mark of node.marks) {
      const markBlock = this.blocks[mark.type.name];
      if (markBlock) {
        const decorator = markBlock.serializer(
          node,
          this.serialize.bind(this)
        ) as (content: string, mark: Mark) => string;
        content = decorator(content, mark);
      }
    }
    return content;
  }

  serializeNode(node: Node): string {
    if (node.type.name === "paragraph") {
      return this.serializeMark(this.serialize(node.content), node);
    }
    const block = this.blocks[node.type.name];
    // text and other
    if (!block) {
      return this.serializeMark(node.textContent, node);
    }
    return this.serializeMark(
      block.serializer(node, this.serialize.bind(this)) as string,
      node
    );
  }

  serialize(nodes: Fragment | Node[] | Node): string {
    let result = "";
    if (nodes instanceof Fragment) {
      nodes.forEach(node => {
        result += this.serializeNode(node);
        if ((node.isBlock || node.isTextblock) && node !== nodes.lastChild) {
          result += "\n\n";
        }
      });
    } else if (nodes instanceof Array) {
      for (const node of nodes) {
        result += this.serializeNode(node);
        if (
          (node.isBlock || node.isTextblock) &&
          node !== nodes[nodes.length - 1]
        ) {
          result += "\n\n";
        }
      }
    } else {
      result += this.serializeNode(nodes);
    }
    return result;
  }
}
