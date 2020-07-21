import { Node } from "tiptap";
import { CommandFunction } from "tiptap-commands";
import { Node as ProsemirrorNode, NodeSpec } from "prosemirror-model";
import { computed, defineComponent } from "@vue/composition-api";

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
        updateAttrs: {},
        view: {}
      },
      setup(props) {
        const src = computed({
          get: () => props.node?.attrs.src,
          // @ts-ignore
          set: (src: string) => props.updateAttrs({ src })
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
