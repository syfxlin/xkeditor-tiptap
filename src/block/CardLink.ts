import { Mark } from "tiptap";
import { MarkSpec, MarkType, Schema } from "@/utils/prosemirror";
import LinkPlugin from "@/block/LinkPlugin";
import markInputRule from "@/utils/markInputRule";

export default class CardLink extends Mark {
  get name() {
    return "card_link";
  }

  get defaultOptions() {
    return {
      openOnClick: false,
      open: (attrs: { [p: string]: string }) => {
        window.open(attrs.href);
      },
      concatLink: (href: string) => href
    };
  }

  get schema(): MarkSpec {
    return {
      attrs: {
        href: {
          default: null
        },
        title: {
          default: null
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
              title: dom.getAttribute("title")
            };
          }
        }
      ],
      toDOM: mark => [
        "a",
        {
          title: mark.attrs.title,
          href: this.options.concatLink(mark.attrs.href)
        },
        0
      ]
    };
  }

  inputRules({ type, schema }: { type: MarkType; schema: Schema }): any[] {
    return [
      markInputRule(
        /\[\[([^\]]+)]]$/,
        type,
        match => {
          const split = match[1].split(/\|| "|"/);
          const result =
            split.length === 4 || split.length === 2 ? split[1] : split[0];
          return `[${result}]`;
        },
        match => {
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
      )
    ];
  }

  get plugins() {
    return [
      LinkPlugin(
        this.options.openOnClick,
        s => s.marks.card_link,
        this.options.open
      )
    ];
  }
}
