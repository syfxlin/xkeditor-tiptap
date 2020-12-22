import { Node } from "tiptap";
import {
  Node as ProsemirrorNode,
  NodeSpec,
  NodeType,
  Plugin,
  Schema
} from "@/utils/prosemirror";
import { computed, defineComponent, ref } from "vue-demi";
import nodeInputRule from "@/utils/nodeInputRule";
import katex from "katex";
import "katex/dist/katex.min.css";
import inlineNodePasteRule from "@/utils/inlineNodePasteRule";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";
import { Actions, useAction } from "@/store";

export default class Katex extends Node {
  get name() {
    return "katex";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      inline: true,
      group: "inline",
      attrs: {
        tex: {
          default: null
        }
      },
      parseDOM: [
        {
          tag: `[data-type=${this.name}]`,
          getAttrs: node => ({
            tex: (node as HTMLElement).textContent
          })
        },
        {
          tag: "span.katex",
          getAttrs: node => {
            const dom = node as HTMLElement;
            const tex = dom.querySelector(
              'annotation[encoding="application/x-tex"]'
            );
            if (tex) {
              return {
                tex: tex.textContent
              };
            } else {
              return {
                tex: dom.textContent
              };
            }
          }
        }
      ],
      toDOM: node => {
        return ["span", { "data-type": this.name }, node.textContent];
      },
      parseMarkdown: [
        {
          type: "tex",
          getContent: token => (token as Tokens.Tex).text
        }
      ],
      toMarkdown: node => `$$${node.textContent}$$`
    };
  }

  get view() {
    return defineComponent({
      name: "node_katex",
      props: {
        node: ProsemirrorNode,
        updateAttrs: Function
      },
      setup(props) {
        const katexHtml = computed(() =>
          katex.renderToString(props.node?.attrs.tex || "", {
            throwOnError: false
          })
        );
        const element = ref<HTMLElement>();
        const popover = useAction<Actions>().popover;
        const click = () => {
          popover.show({
            ref: element.value,
            command: "katex",
            data: {
              tex: props.node?.attrs.tex
            },
            buttons: [
              {
                label: "确定",
                handler: p => {
                  if (props.updateAttrs) {
                    props.updateAttrs(p.data);
                  }
                  popover.hide();
                },
                type: "primary"
              }
            ]
          });
        };

        return { katexHtml, click, element };
      },
      template: `
        <span data-type="katex" v-html="katexHtml" @click="click" ref="element"></span>
      `
    });
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [
      nodeInputRule(/\$\$([^$]+)\$\$/, type, 1, match => ({
        tex: match[1]
      }))
    ];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return [
      inlineNodePasteRule(/\$\$([^$]+)\$\$/, type, 1, match => ({
        tex: match[1]
      }))
    ];
  }
}
