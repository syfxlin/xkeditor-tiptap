import {CommandGetter, Editor as TipTapEditor, Node} from "tiptap";
import {CommandFunction, setBlockType, textblockTypeInputRule, toggleBlockType} from "tiptap-commands";
import {Node as ProsemirrorNode, NodeSpec, NodeType, Schema} from "prosemirror-model";
import {Command} from "prosemirror-commands";
import {Plugin, Selection} from "prosemirror-state";
import {computed, defineComponent, ref} from "vue-demi";
import {cmRef, dirFocus, isCm} from "@/utils/codemirror";
import CodeMirrorComponent from "@/block/CodeMirrorComponent.vue";
import HighlightPlugin from "@/block/Highlight";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/plugins/toolbar/prism-toolbar.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import {codePasteRule} from "@/utils/codePasteRule";

const arrowHandler = (
  dir: "left" | "right" | "down" | "up" | "backspace" | "delete"
): Command => {
  return (state, dispatch, view) => {
    let eot = dir;
    if (eot === "backspace") {
      eot = "left";
    } else if (eot === "delete") {
      eot = "right";
    }
    if (state.selection.empty && view && view.endOfTextblock(eot)) {
      const side = eot === "left" || eot === "up" ? -1 : 1;
      const $head = state.selection.$head;
      const nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side
      );
      if (isCm(nextPos)) {
        dirFocus(cmRef(nextPos), side);
        return true;
      }
    }
    return false;
  };
};

export default class CodeMirrorNode extends Node {
  get name() {
    return "code_mirror";
  }

  get schema(): NodeSpec {
    return {
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      isolating: true,
      attrs: {
        cmRef: {
          default: undefined
        },
        language: {
          default: null
        },
        isEditing: {
          default: true
        }
      },
      parseDOM: [
        {
          tag: "pre",
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
          },
          getAttrs: node => {
            const dom = node as HTMLElement;
            let language = dom.getAttribute("data-language");
            if (language === null) {
              language = dom.getAttribute("language");
            }
            if (language === null) {
              const match = dom.className.match(/lang(uage|)[-_]([^ ]+)/);
              if (match && match.length > 2) {
                language = match[2];
              }
            }
            return {
              language
            };
          }
        }
      ],
      toDOM(node) {
        return ["pre", { "data-language": node.attrs.language }, 0];
      }
    };
  }

  get view() {
    return defineComponent({
      components: {
        CodeMirrorComponent
      },
      props: {
        node: ProsemirrorNode,
        updateAttrs: Function,
        view: Object,
        options: Object,
        selected: Boolean,
        editor: TipTapEditor,
        getPos: Function,
        decorations: Array
      },
      setup(props) {
        const content = ref<HTMLElement>();
        const edit = () => {
          if (props.updateAttrs) {
            props.updateAttrs({
              isEditing: true
            });
          }
        };

        const blur = () => {
          if (props.updateAttrs) {
            props.updateAttrs({
              isEditing: false
            });
          }
        };

        const lines = computed(
          () => props.node?.textContent.split("\n").length
        );

        return { content, edit, blur, lines };
      },
      template: `
        <div contenteditable="false"><code-mirror-component
              v-show="node.attrs.isEditing"
              :node="node"
              :update-attrs="updateAttrs"
              :view="view"
              :options="options"
              :selected="selected"
              :editor="editor"
              :get-pos="getPos"
              :decorations="decorations"
              :content-ref="content"
              @blur="blur"
          /><div class="code-toolbar"><pre class="line-numbers" v-show="!node.attrs.isEditing">
              <span aria-hidden="true" class="line-numbers-rows"><span v-for="n in lines"></span></span>
              <code ref="content"></code>
            </pre><div class="toolbar">
              <div class="toolbar-item"><span>{{node.attrs.language}}</span></div>
              <div class="toolbar-item toolbar-action"><span @click="edit">Edit</span></div>
            </div></div></div>
      `
    });
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
    return () => toggleBlockType(type, schema.nodes.paragraph);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: NodeSpec;
  }): { [p: string]: CommandFunction } {
    return {
      "Shift-Ctrl-\\": setBlockType(type),
      ArrowLeft: arrowHandler("left"),
      ArrowRight: arrowHandler("right"),
      ArrowUp: arrowHandler("up"),
      ArrowDown: arrowHandler("down"),
      Backspace: arrowHandler("backspace"),
      Delete: arrowHandler("delete")
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [textblockTypeInputRule(/^```$/, type)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return [codePasteRule(type, schema)];
  }

  get plugins() {
    return [HighlightPlugin({ name: this.name })];
  }
}
