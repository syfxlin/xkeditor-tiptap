import { Node } from "tiptap";
import { NodeSpec } from "@/utils/prosemirror";
import { NodeType, Schema } from "prosemirror-model";
import nodeInputRule from "@/utils/nodeInputRule";
import TocPlugin, { toc } from "@/block/plugins/TocPlugin";
import { defineComponent } from "vue-demi";
import { MdSpec } from "@/block/other/MdSpec";
import { Tokens } from "@/block/other/MarkdownLexer";

export default class Toc extends Node {
  get name() {
    return "toc";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      group: "block",
      attrs: {
        fold: {
          default: true
        }
      },
      parseDOM: [
        {
          tag: `ul[data-type="${this.name}"]`,
          getAttrs: node => {
            const dom = node as HTMLElement;
            return {
              fold: dom.getAttribute("data-fold") === "fold"
            };
          }
        },
        { tag: "ul.toc" }
      ],
      toDOM: node => [
        "ul",
        {
          "data-type": this.name,
          "data-fold": node.attrs.fold ? "fold" : "unfold"
        },
        0
      ],
      parseMarkdown: [
        {
          type: "toc",
          getAttrs: token => ({ fold: (token as Tokens.Toc).fold })
        }
      ],
      toMarkdown: node => `[TOC${node.attrs.fold ? " :fold" : ""}]`
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [
      nodeInputRule(/^\[(TOC|toc)([^\]]*)\]$/, type, null, match => {
        return {
          fold: match[2].endsWith(":fold")
        };
      })
    ];
  }

  // TODO: paste rule

  get plugins() {
    return [TocPlugin()];
  }

  get view() {
    const List = defineComponent({
      name: "node_toc_list",
      props: {
        items: Array
      },
      template: `
        <ul>
          <li v-for="item in items">
            <a :href="'#' + encodeURI(
              item.head.textContent
            )">{{item.head.textContent}}</a>
            <node_toc_list :items="item.sub" />
          </li>
        </ul>
      `.replace(/>\s+</g, "><")
    });
    return defineComponent({
      components: {
        List
      },
      setup() {
        return { toc };
      },
      template: `
        <list :items="toc" />
      `.replace(/>\s+</g, "><")
    });
  }
}
