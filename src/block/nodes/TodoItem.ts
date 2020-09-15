import { Node } from "tiptap";
import {
  CommandFunction,
  liftListItem,
  sinkListItem,
  splitToDefaultListItem
} from "tiptap-commands";
import { NodeSpec, NodeType, Schema } from "@/utils/prosemirror";
import { defineComponent } from "vue-demi";
import { Node as ProsemirrorNode } from "prosemirror-model";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";

export default class TodoItem extends Node {
  get name() {
    return "todo_item";
  }

  get defaultOptions() {
    return {
      nested: false
    };
  }

  get view() {
    return defineComponent({
      props: {
        node: ProsemirrorNode,
        updateAttrs: Function,
        view: Object
      },
      setup(props) {
        return {
          onChange: () => {
            if (props.updateAttrs) {
              props.updateAttrs({ done: !props.node?.attrs.done });
            }
          }
        };
      },
      template: `
        <li :data-type="node.type.name" :data-done="node.attrs.done.toString()" data-drag-handle>
          <span class="todo-checkbox" contenteditable="false" @click="onChange"></span>
          <div class="todo-content" ref="content" :contenteditable="view.editable.toString()"></div>
        </li>
      `
    });
  }

  get schema(): NodeSpec & MdSpec {
    return {
      attrs: {
        done: {
          default: false
        }
      },
      draggable: true,
      content: this.options.nested ? "(paragraph|todo_list)+" : "paragraph+",
      toDOM: node => {
        const { done } = node.attrs;

        return [
          "li",
          {
            "data-type": this.name,
            "data-done": done.toString()
          },
          ["span", { class: "todo-checkbox", contenteditable: "false" }],
          ["div", { class: "todo-content" }, 0]
        ];
      },
      parseDOM: [
        {
          priority: 51,
          tag: `[data-type="${this.name}"]`,
          getAttrs: node => ({
            done: (node as HTMLElement).getAttribute("data-done") === "true"
          })
        }
      ],
      parseMarkdown: [
        {
          type: "list_item",
          matcher: token => (token as Tokens.ListItem).task,
          getAttrs: token => ({
            done: (token as Tokens.ListItem).checked
          }),
          getContent: (token, s, parser) => {
            const nodes = parser((token as Tokens.ListItem).tokens);
            const first = nodes[0];
            if (first && first.isText) {
              nodes.shift();
              nodes.unshift(s.node("paragraph", undefined, first));
            }
            return nodes;
          }
        }
      ],
      toMarkdown: (node, serializer) =>
        `[${node.attrs.done ? "x" : " "}] ${serializer(node.content)}`
    };
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: Schema;
  }): { [p: string]: CommandFunction } {
    return {
      Enter: splitToDefaultListItem(type),
      Tab: this.options.nested ? sinkListItem(type) : () => false,
      "Shift-Tab": liftListItem(type)
    };
  }
}
