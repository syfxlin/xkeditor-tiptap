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
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";
import { Slice } from "prosemirror-model";
import { upload } from "@/utils/req";
import { state } from "@/store/state";
// @ts-ignore
import Message from "element-ui/packages/message";
import { defineComponent, ref } from "vue-demi";
import { Actions, useAction } from "@/store";

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
      ],
      toMarkdown: node =>
        `![${node.attrs.alt}](${node.attrs.src}${
          node.attrs.title ? ` "${node.attrs.title}"` : ""
        })`
    };
  }

  get view() {
    return defineComponent({
      name: "node_image",
      props: {
        node: Object,
        updateAttrs: Function,
        selected: Boolean
      },
      setup(props) {
        const image = ref<HTMLElement>();
        const popover = useAction<Actions>().popover;

        const click = () => {
          popover.show({
            ref: image.value,
            command: "image",
            data: {
              src: props.node?.attrs.src,
              title: props.node?.attrs.title,
              alt: props.node?.attrs.alt
            },
            buttons: [
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

        return { image, click };
      },
      template: `
        <img :src="node.attrs.src" :title="node.attrs.title" :alt="node.attrs.alt" ref="image" @click="click" :class="selected ? 'is-selected' : ''" />
      `.replace(/>\s+</g, "><")
    });
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
          },
          handlePaste: (
            view: EditorView,
            event: ClipboardEvent,
            slice: Slice
          ) => {
            if (event.clipboardData && state.config.xk.uploadImage) {
              const { schema } = view.state;
              const coordinates = view.state.selection.$anchor;
              for (const item of event.clipboardData.items) {
                const file = item.getAsFile();
                if (file) {
                  const loading = Message({
                    message: "正在上传...",
                    showClose: true,
                    duration: 0
                  });
                  upload({
                    file: file,
                    filename: "file",
                    action: state.config.xk.uploadImage,
                    onSuccess: res => {
                      loading.close();
                      Message({
                        message: "上传成功",
                        type: "success"
                      });
                      const node = schema.nodes.image.create({
                        src: res.data.url,
                        alt: res.data.filename,
                        title: res.data.key
                      });
                      const transaction = view.state.tr.insert(
                        coordinates.pos,
                        node
                      );
                      view.dispatch(transaction);
                    },
                    onError: err => {
                      loading.close();
                      let message = "上传失败";
                      if (err.res) {
                        message = err.res.message;
                      }
                      Message({
                        message,
                        type: "error"
                      });
                    }
                  });
                }
              }
            }
            return false;
          }
        }
      })
    ];
  }
}
