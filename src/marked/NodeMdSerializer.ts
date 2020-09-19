import {
  Fragment,
  Mark,
  MarkType,
  Node,
  NodeType,
  Schema
} from "@/utils/prosemirror";
import { MdSpec } from "@/marked/MdSpec";
import { ExtensionManager } from "tiptap";

export type MdSerializerRule = (
  node: Node,
  serializer: NodeMdSerializer
) => string | ((content: string, mark: Mark) => string);

export class NodeMdSerializer {
  public readonly schema: Schema;
  public readonly manager: ExtensionManager;
  private readonly blocks: {
    [tokenType: string]: {
      serializer: MdSerializerRule;
      block: MarkType | NodeType;
    };
  };

  constructor(manager: ExtensionManager) {
    this.manager = manager;
    this.schema = manager.view.state.schema;
    this.blocks = {};
    for (const block of [
      ...Object.values(this.schema.marks),
      ...Object.values(this.schema.nodes)
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

  private serializeMark(content: string, node: Node): string {
    for (const mark of node.marks) {
      const markBlock = this.blocks[mark.type.name];
      if (markBlock) {
        const decorator = markBlock.serializer(node, this) as (
          content: string,
          mark: Mark
        ) => string;
        content = decorator(content, mark);
      }
    }
    return content;
  }

  private serializeNode(node: Node): string {
    // doc
    if (node.type.name === "doc") {
      return this.serializeMark(this.serialize(node.content), node);
    }
    // paragraph
    if (node.type.name === "paragraph") {
      return this.serializeMark(this.serialize(node.content), node);
    }
    const block = this.blocks[node.type.name];
    // text and other
    if (!block) {
      return this.serializeMark(node.textContent, node);
    }
    return this.serializeMark(block.serializer(node, this) as string, node);
  }

  serialize(nodes: Fragment | Node[] | Node, separator = "\n\n"): string {
    let result = "";
    if (nodes instanceof Fragment) {
      nodes.forEach(node => {
        result += this.serializeNode(node);
        if ((node.isBlock || node.isTextblock) && node !== nodes.lastChild) {
          result += separator;
        }
      });
    } else if (nodes instanceof Array) {
      for (const node of nodes) {
        result += this.serializeNode(node);
        if (
          (node.isBlock || node.isTextblock) &&
          node !== nodes[nodes.length - 1]
        ) {
          result += separator;
        }
      }
    } else {
      result += this.serializeNode(nodes);
    }
    return result;
  }
}
