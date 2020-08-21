import { CommandGetter, Mark } from "tiptap";
import { pasteRule, removeMark, updateMark } from "tiptap-commands";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import markInputRule from "@/utils/markInputRule";
import LinkPlugin from "@/block/LinkPlugin";

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

  get schema(): MarkSpec {
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
      ]
    };
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

  get plugins() {
    return [
      LinkPlugin(
        this.options.openOnClick,
        s => s.marks.link,
        attrs => window.open(attrs.href, attrs.target)
      )
    ];
  }
}
