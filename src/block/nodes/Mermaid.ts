import { Node } from "tiptap";
import { NodeSpec, NodeType, Schema } from "@/utils/prosemirror";
import { mergeNodeSpec, nodeKeys, scEditor } from "@/utils/ace";
import { CommandFunction, textblockTypeInputRule } from "tiptap-commands";
import mermaid from "mermaid";
import { useDebounceFn } from "@vueuse/core";
import { Ref } from "vue-demi";
import { errSvg } from "@/utils/mermaid-error.ts";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";

mermaid.initialize({
  startOnLoad: false
});

export default class Mermaid extends Node {
  get name() {
    return "mermaid";
  }

  get schema(): NodeSpec & MdSpec {
    return mergeNodeSpec({
      parseDOM: [
        {
          tag: `pre[data-type="${this.name}"]`,
          preserveWhitespace: "full",
          contentElement: node => {
            const dom = node as HTMLPreElement;
            if (
              dom.children.length === 1 &&
              dom.children[0].tagName.toLowerCase() === "code"
            ) {
              return dom.children[0];
            }
            return dom;
          }
        }
      ],
      toDOM: node => ["pre", { "data-type": this.name }, ["code", 0]],
      parseMarkdown: [
        {
          type: "mermaid",
          getContent: token => (token as Tokens.Mermaid).text
        }
      ],
      toMarkdown: node => `:::mer\n${node.textContent}\n:::`
    });
  }

  get view() {
    const convertFn = useDebounceFn((code: string, htmlView: Ref<string>) => {
      try {
        mermaid.parse(code);
        mermaid.render(this.name, code, svgCode => {
          htmlView.value = svgCode;
        });
      } catch (e) {
        htmlView.value = errSvg;
      }
    }, 500);
    return scEditor(this.name, (code, htmlView) => {
      convertFn(code, htmlView);
    });
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: Schema;
  }): { [p: string]: CommandFunction } {
    return {
      ...nodeKeys(node => node.type.name === this.name)
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [textblockTypeInputRule(/^(:::|;;;)\s?mer$/, type)];
  }
}
