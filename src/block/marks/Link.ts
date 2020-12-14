import { CommandGetter, Mark } from "tiptap";
import { pasteRule, removeMark, updateMark } from "tiptap-commands";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import markInputRule from "@/utils/markInputRule";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";
import { defineComponent, ref } from "vue-demi";
import { Actions, useAction } from "@/store";

export default class Link extends Mark {
  get name() {
    return "link";
  }

  get defaultOptions() {
    return {
      openOnClick: false,
      target: null
    };
  }

  get schema(): MarkSpec & MdSpec {
    return {
      attrs: {
        href: {
          default: null
        },
        target: {
          default: null
        },
        title: {
          default: null
        }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs: mark => {
            const dom = mark as HTMLElement;
            return {
              href: dom.getAttribute("href"),
              target: dom.getAttribute("target"),
              title: dom.getAttribute("title")
            };
          }
        }
      ],
      toDOM: mark => [
        "a",
        {
          ...mark.attrs,
          rel: "noopener noreferrer nofollow",
          target: this.options.target
        },
        0
      ],
      parseMarkdown: [
        {
          type: "link",
          getAttrs: t => {
            const token = t as Tokens.Link;
            return {
              href: token.href,
              title: token.title
            };
          },
          getContent: token => (token as Tokens.Link).text
        }
      ],
      toMarkdown: () => (content, mark) =>
        `[${content}](${mark.attrs.href}${
          mark.attrs.title ? ` "${mark.attrs.title}"` : ""
        })`
    };
  }

  get view() {
    return defineComponent({
      name: "node_link",
      props: {
        node: Object,
        updateAttrs: Function,
        view: Object
      },
      setup(props) {
        const content = ref<HTMLElement>();
        const popover = useAction<Actions>().popover;

        const click = () => {
          popover.show({
            ref: content.value,
            command: "link",
            data: {
              href: props.node?.attrs.href
            },
            submit: {
              label: "确定",
              handler: p => {
                if (props.updateAttrs) {
                  props.updateAttrs(p.data);
                }
                popover.hide();
              }
            }
          });
        };

        return { content, click };
      },
      template: `
        <a :href="node.attrs.href" :title="node.attrs.title" :target="node.attrs.target" ref="content" @click="click"></a>
      `.replace(/>\s+</g, "><")
    });
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: MarkType;
    schema: Schema;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return attrs => {
      if (attrs.href) {
        return updateMark(type, attrs);
      }

      return removeMark(type);
    };
  }

  inputRules({ type, schema }: { type: MarkType; schema: Schema }): any[] {
    return [
      markInputRule(/\[([^\]]+)]\(([^)]+)\)$/, type, 1, match => {
        const split = match[2].split(' "');
        return {
          href: split[0],
          title:
            split.length > 1 ? split[1].substring(0, split[1].length - 1) : null
        };
      })
    ];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [
      pasteRule(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi,
        type,
        url => ({ href: url })
      )
    ];
  }
}
