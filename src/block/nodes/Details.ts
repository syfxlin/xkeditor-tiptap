import { Node } from "tiptap";
import {
  Node as ProsemirrorNode,
  NodeSpec,
  NodeType,
  Schema
} from "@/utils/prosemirror";
import nodeListPasteRule, { Matched } from "@/utils/nodeListPasteRule";
import { defineComponent } from "@vue/composition-api";
import { wrappingInputRule } from "tiptap-commands";

export default class Details extends Node {
  get name() {
    return "details";
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        open: {
          default: false
        },
        summary: {
          default: null
        }
      },
      content: "block*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: [
        {
          tag: "details",
          getAttrs: node => {
            const dom = node as HTMLElement;
            const summaryEle = dom.querySelector("summary");
            let summary: null | string = null;
            if (summaryEle) {
              summary = summaryEle.textContent;
              summaryEle.remove();
            }
            return {
              summary
            };
          }
        }
      ],
      toDOM: node => {
        if (node.attrs.summary !== null) {
          return ["details", ["summary", node.attrs.summary], 0];
        } else {
          return ["details", 0];
        }
      }
    };
  }

  get view() {
    return defineComponent({
      name: "details",
      props: {
        node: ProsemirrorNode,
        updateAttrs: Function
      },
      template: `
        <details :open="node.attrs.open" @toggle="updateAttrs({ open: !node.attrs.open })">
          <summary v-if="node.attrs.summary !== null">{{ node.attrs.summary }}</summary>
          <div ref="content"></div>
        </details>
      `.replace(/>\s+</g, "><")
    });
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [
      wrappingInputRule(/^(:::|;;;)\s?det\s?([^:;]*)[:;]$/, type, match => ({
        summary: match[2]
      }))
    ];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    let summary: string | null = null;
    let contents: ProsemirrorNode[] = [];
    return [
      nodeListPasteRule(
        content => {
          const match = /^(:::|;;;)\s?det\s?(.*)$/.exec(content);
          if (match) {
            summary = match[2];
            return Matched.CONTAIN_SKIP;
          }
          return Matched.NOT;
        },
        content =>
          /^(:::|;;;)$/.test(content) ? Matched.NOT_SKIP : Matched.CONTAIN,
        (content, node) => {
          contents.push(node);
          return false;
        },
        undefined,
        (content, node, nodes) => {
          nodes.push(type.create({ summary: summary || "详细信息" }, contents));
          summary = null;
          contents = [];
        }
      )
    ];
  }
}
