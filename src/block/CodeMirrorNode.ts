import { CommandGetter, Editor as TipTapEditor, Node } from "tiptap";
import {
  CommandFunction,
  setBlockType,
  textblockTypeInputRule,
  toggleBlockType
} from "tiptap-commands";
import {
  Node as ProsemirrorNode,
  NodeSpec,
  NodeType,
  Schema
} from "prosemirror-model";
import { Command } from "prosemirror-commands";
import { Plugin, Selection } from "prosemirror-state";
import { defineComponent, ref } from "vue-demi";
import { cmRef, codePasteRules, dirFocus, isCm } from "@/utils/codemirror";
import CodeMirrorComponent from "@/block/CodeMirrorComponent.vue";
import HighlightPlugin from "@/block/Highlight";
import "prismjs/themes/prism-okaidia.css";

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
        }
      },
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
          getAttrs: dom => ({
            language: (dom as HTMLElement).getAttribute("data-language")
          })
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
      setup() {
        const isEditor = ref(true);
        const content = ref<HTMLElement>();
        const sw = () => {
          isEditor.value = !isEditor.value;
        };

        return { isEditor, content, sw };
      },
      template: `
        <div contenteditable="false">
          <button @click="sw">Switch</button>
          <code-mirror-component
              v-show="isEditor"
              :node="node"
              :update-attrs="updateAttrs"
              :view="view"
              :options="options"
              :selected="selected"
              :editor="editor"
              :get-pos="getPos"
              :decorations="decorations"
              :content-ref="content"
          />
          <pre v-show="!isEditor"><code ref="content"></code></pre>
        </div>
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
    return [codePasteRules(type, schema)];
  }

  get plugins() {
    return [HighlightPlugin({ name: this.name })];
  }
}
