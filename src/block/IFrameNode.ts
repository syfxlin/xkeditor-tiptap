import { Node } from "tiptap";
import { CommandFunction } from "tiptap-commands";
import { Node as ProsemirrorNode, NodeSpec } from "@/utils/prosemirror";
import { computed, defineComponent } from "vue-demi";

export default class IframeNode extends Node {
  get name() {
    return "iframe";
  }

  get schema(): NodeSpec {
    return {
      attrs: {
        src: {
          default: null
        }
      },
      group: "block",
      selectable: false,
      parseDOM: [
        {
          tag: "iframe",
          getAttrs: dom => ({
            src: (dom as HTMLIFrameElement).getAttribute("src")
          })
        }
      ],
      toDOM: node => [
        "iframe",
        {
          src: node.attrs.src
        }
      ]
    };
  }

  commands() {
    const command: CommandFunction = () => {
      console.log("command");
      return true;
    };
    return () => command;
  }

  get view() {
    return defineComponent({
      props: {
        node: ProsemirrorNode,
        updateAttrs: Function,
        view: Object
      },
      setup(props) {
        const src = computed({
          get: () => props.node?.attrs.src,
          set: (src: string) => {
            if (props.updateAttrs !== undefined) {
              props.updateAttrs({ src });
            }
          }
        });

        return { src };
      },
      template: `
        <div class="iframe">
          <iframe class="iframe__embed" :src="src"></iframe>
          <input class="iframe__input" @paste.stop type="text" v-model="src" v-if="view.editable" />
        </div>
      `
    });
  }
}
