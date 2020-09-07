import { Node } from "tiptap";
import {
  Node as ProsemirrorNode,
  NodeSpec,
  NodeType,
  Plugin,
  Schema
} from "@/utils/prosemirror";
import { computed, defineComponent } from "vue-demi";
import nodeInputRule from "@/utils/nodeInputRule";
import katex from "katex";
import "katex/dist/katex.min.css";
import inlineNodePasteRule from "@/utils/inlineNodePasteRule";
import { MdSpec, Tokens } from "@/block/other/MdSpec";

export default class Katex extends Node {
  get name() {
    return "katex";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      inline: true,
      group: "inline",
      parseDOM: [
        { tag: `[data-type=${this.name}]` },
        {
          tag: "span.katex",
          contentElement: node => {
            const dom = node as HTMLElement;
            const tex = dom.querySelector(
              'annotation[encoding="application/x-tex"]'
            );
            return tex || dom;
          }
        }
      ],
      toDOM: node => {
        return ["span", { "data-type": this.name }, 0];
      },
      parseMarkdown: [
        {
          type: "tex",
          getContent: token => (token as Tokens.Tex).tex
        }
      ]
    };
  }

  get view() {
    return defineComponent({
      name: "katex",
      props: {
        node: ProsemirrorNode,
        updateAttrs: Function
      },
      setup(props) {
        const katexHtml = computed(() =>
          katex.renderToString(props.node?.textContent || "", {
            throwOnError: false
          })
        );
        return { katexHtml };
      },
      template: `
        <span data-type="katex" v-html="katexHtml"></span>
      `
    });
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [nodeInputRule(/\$+([^$]+)\$+/, type, 1)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return [inlineNodePasteRule(/\$+([^$]+)\$+/, type, 1)];
  }
}
