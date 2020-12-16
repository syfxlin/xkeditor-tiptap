import { CommandGetter, Mark } from "tiptap";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import markInputRule from "@/utils/markInputRule";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";
import markPasteRule from "@/utils/markPasteRule";
import { defineComponent, ref } from "vue-demi";
import { Actions, useAction } from "@/store";
import { removeMark, updateMark } from "tiptap-commands";

export function getLinkContent(match: string[]): string {
  const split = match[1].split(/\|| "|"/);
  const result = split.length === 4 || split.length === 2 ? split[1] : split[0];
  return `${result}`;
}

export function getLinkAttrs(match: string): { [key: string]: any } {
  const split = match[1].split(/\|| "|"/);
  let title = null;
  if (split.length === 4) {
    title = split[2];
  } else if (split.length === 3) {
    title = split[1];
  }
  return {
    href: split[0],
    title
  };
}

export default class CardLink extends Mark {
  get name() {
    return "card_link";
  }

  get defaultOptions() {
    return {
      concatLink: (href: string) => href
    };
  }

  get schema(): MarkSpec & MdSpec {
    return {
      attrs: {
        href: {
          default: null
        },
        title: {
          default: null
        },
        target: {
          default: true
        }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[data-clink]",
          getAttrs: mark => {
            const dom = mark as HTMLElement;
            return {
              href: dom.getAttribute("href"),
              title: dom.getAttribute("title"),
              target: dom.getAttribute("target") === "_blank"
            };
          }
        }
      ],
      toDOM: mark => [
        "a",
        {
          title: mark.attrs.title,
          href: this.options.concatLink(mark.attrs.href),
          target: mark.attrs.target ? "_blank" : "_self"
        },
        0
      ],
      parseMarkdown: [
        {
          type: "card_link",
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
      toMarkdown: () => (content, mark) => {
        let result = `[[${mark.attrs.href}`;
        if (content !== mark.attrs.href) {
          result += `|${content}`;
        }
        if (mark.attrs.title) {
          result += ` "${mark.attrs.title}"`;
        }
        return `${result}]]`;
      }
    };
  }

  get view() {
    return defineComponent({
      name: "node_card_link",
      props: {
        node: Object,
        updateAttrs: Function
      },
      setup(props) {
        const content = ref<HTMLElement>();
        const popover = useAction<Actions>().popover;

        const click = () => {
          popover.show({
            ref: content.value,
            command: "link",
            data: {
              href: props.node?.attrs.href,
              title: props.node?.attrs.title,
              target: props.node?.attrs.target
            },
            buttons: [
              {
                label: "打开链接",
                handler: () => {
                  window.open(
                    props.node?.attrs.href,
                    props.node?.attrs.target ? "_blank" : "_self"
                  );
                },
                type: "text"
              },
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

        return { content, click };
      },
      template: `
        <a :href="node.attrs.href" :title="node.attrs.title" :target="node.attrs.target ? '_blank' : '_self'" ref="content" @click="click"></a>
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
        return updateMark(type, {
          ...attrs,
          href: this.options.concatLink(attrs.href)
        });
      }

      return removeMark(type);
    };
  }

  inputRules({ type, schema }: { type: MarkType; schema: Schema }): any[] {
    return [
      markInputRule(/\[\[([^\]]+)]]$/, type, getLinkContent, getLinkAttrs)
    ];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [
      markPasteRule(/\[\[([^\]]+)]]/, type, getLinkContent, getLinkAttrs)
    ];
  }
}
