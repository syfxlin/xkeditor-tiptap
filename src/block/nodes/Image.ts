import { CommandGetter, Node } from "tiptap";
import { nodeInputRule } from "tiptap-commands";
import {
  EditorView,
  NodeSpec,
  NodeType,
  Plugin,
  Schema
} from "@/utils/prosemirror";
import inlineNodePasteRule from "@/utils/inlineNodePasteRule";
import { MdSpec, Tokens } from "@/block/other/MdSpec";

/**
 * Matches following attributes in Markdown-typed image: [, alt, src, title]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "Ipsum") -> [, "", "image.jpg", "Ipsum"]
 * ![Lorem](image.jpg "Ipsum") -> [, "Lorem", "image.jpg", "Ipsum"]
 */
const IMAGE_INPUT_REGEX = /!\[([^\]]*)]\(([^)"]*)(?:(?:\s+)["'](\S+)["'])?\)/;

export default class Image extends Node {
  get name() {
    return "image";
  }

  get schema(): NodeSpec & MdSpec {
    return {
      inline: true,
      attrs: {
        src: {},
        alt: {
          default: null
        },
        title: {
          default: null
        }
      },
      group: "inline",
      draggable: true,
      parseDOM: [
        {
          tag: "img[src]",
          getAttrs: node => {
            const dom = node as HTMLElement;
            return {
              src: dom.getAttribute("src"),
              title: dom.getAttribute("title"),
              alt: dom.getAttribute("alt")
            };
          }
        }
      ],
      toDOM: node => ["img", node.attrs],
      parseMarkdown: [
        {
          type: "image",
          getAttrs: t => {
            const token = t as Tokens.Image;
            return {
              src: token.href,
              title: token.title,
              alt: token.text
            };
          }
        }
      ]
    };
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: NodeType;
    schema: Schema;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return attrs => (state, dispatch) => {
      const selection = state.selection as any;
      const position = selection.$cursor
        ? selection.$cursor.pos
        : selection.$to.pos;
      const node = type.create(attrs);
      const transaction = state.tr.insert(position, node);
      if (dispatch) {
        dispatch(transaction);
        return true;
      }
      return false;
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [
      nodeInputRule(IMAGE_INPUT_REGEX, type, match => {
        const [, alt, src, title] = match;
        return {
          src,
          alt,
          title
        };
      })
    ];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    return [
      inlineNodePasteRule(IMAGE_INPUT_REGEX, type, null, match => {
        const [, alt, src, title] = match;
        return {
          src,
          alt,
          title
        };
      })
    ];
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            // @ts-ignore
            drop(view: EditorView, event: DragEvent) {
              if (
                !event.dataTransfer ||
                !event.dataTransfer.files ||
                !event.dataTransfer.files.length
              ) {
                return;
              }

              const images = Array.from(event.dataTransfer.files).filter(file =>
                /image/i.test(file.type)
              );

              if (images.length === 0) {
                return;
              }

              event.preventDefault();

              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY
              }) as { pos: number; inside: number };

              images.forEach(image => {
                const reader = new FileReader();

                reader.onload = readerEvent => {
                  const node = schema.nodes.image.create({
                    src: readerEvent.target?.result
                  });
                  const transaction = view.state.tr.insert(
                    coordinates.pos,
                    node
                  );
                  view.dispatch(transaction);
                };
                reader.readAsDataURL(image);
              });
            }
          }
        }
      })
    ];
  }
}
