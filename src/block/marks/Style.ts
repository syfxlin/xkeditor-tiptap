import { CommandGetter, Mark } from "tiptap";
import {
  Mark as ProseMirrorMark,
  MarkSpec,
  MarkType,
  Plugin,
  Schema,
  TextSelection
} from "@/utils/prosemirror";
import { CommandFunction, toggleMark } from "tiptap-commands";
// @ts-ignore
import addPx from "add-px-to-style";
// @ts-ignore
import hyphenate from "hyphenate-style-name";
import markInputRule from "@/utils/markInputRule";
import markPasteRule from "@/utils/markPasteRule";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";
import { Node } from "prosemirror-model";
import { SelectionRange } from "prosemirror-state";

const DEFAULT_FOREGROUND = "rgb(55, 53, 47)";

const DEFAULT_BACKGROUND = {
  gray: "rgba(206, 205, 202, 0.5)",
  brown: "rgba(155, 154, 151, 0.4)",
  orange: "rgba(245, 93, 0, 0.2)",
  yellow: "rgba(233, 168, 0, 0.2)",
  green: "rgba(0, 135, 107, 0.2)",
  blue: "rgba(0, 120, 223, 0.2)",
  purple: "rgba(103, 36, 222, 0.2)",
  pink: "rgba(221, 0, 129, 0.2)",
  red: "rgba(255, 0, 26, 0.2)"
};

const DEFAULT_SPAN_STYLE = document.createElement("span").style;
const DEFAULT_STYLE_ATTRS: { [key: string]: { default: any } } = {};
for (const [key, value] of Object.entries(DEFAULT_SPAN_STYLE)) {
  DEFAULT_STYLE_ATTRS[hyphenate(key)] = {
    default: value
  };
}

export const convertCss = (style: { [key: string]: any }) => {
  let result = "";
  for (const [key, value] of Object.entries(style)) {
    if (value === "") {
      continue;
    }
    result += hyphenate(key) + ":" + addPx(key, value) + ";";
  }
  return result;
};

export const getStyleAttrs = (match: string[]) => {
  if (match[2].indexOf(":") !== -1) {
    const split = match[2].split(";");
    const styles = {};
    for (const str of split) {
      const kv = str.split(":");
      if (kv.length === 2) {
        // @ts-ignore
        styles[kv[0]] = kv[1];
      }
    }
    return styles;
  } else if (match[2].indexOf(",") !== -1) {
    const colors = match[2].split(",");
    return {
      color: colors[0],
      background: colors[1]
    };
  } else {
    // @ts-ignore
    if (DEFAULT_BACKGROUND[match[2]] !== undefined) {
      return {
        color: DEFAULT_FOREGROUND,
        // @ts-ignore
        background: DEFAULT_BACKGROUND[match[2]]
      };
    } else {
      return {
        color: match[2]
      };
    }
  }
};

export default class Style extends Mark {
  get name() {
    return "style";
  }

  get schema(): MarkSpec & MdSpec {
    return {
      attrs: DEFAULT_STYLE_ATTRS,
      parseDOM: [
        {
          tag: "span[style]",
          getAttrs: mark => {
            const dom = mark as HTMLElement;
            return {
              ...dom.style
            };
          }
        }
      ],
      toDOM: mark => {
        const style = convertCss(mark.attrs);
        if (style.length == 0) {
          return ["span", 0];
        }
        return ["span", { style }, 0];
      },
      parseMarkdown: [
        {
          type: "style",
          getAttrs: token => ({
            ...(token as Tokens.Style).attrs
          }),
          getContent: token => (token as Tokens.Style).text
        }
      ],
      toMarkdown: (node, serializer) => (content, mark) =>
        `[${content}]{${convertCss(mark.attrs)}}`
    };
  }

  keys({
    type,
    schema
  }: {
    type: MarkType;
    schema: MarkSpec;
  }): { [p: string]: CommandFunction } {
    return {
      "Mod-Shift-c": toggleMark(type, {
        color: DEFAULT_FOREGROUND,
        background: DEFAULT_BACKGROUND.blue
      })
    };
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: MarkType;
    schema: MarkSpec;
    attrs: { [p: string]: string };
  }): CommandGetter {
    const markApplies = (
      doc: Node,
      ranges: SelectionRange[],
      type: MarkType
    ) => {
      for (let i = 0; i < ranges.length; i++) {
        const { $from, $to } = ranges[i];
        let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false;
        doc.nodesBetween($from.pos, $to.pos, node => {
          if (can) return false;
          can = node.inlineContent && node.type.allowsMarkType(type);
        });
        if (can) return true;
      }
      return false;
    };
    return options => (state, dispatch) => {
      const { empty, $cursor, ranges } = state.selection as TextSelection;
      if ((empty && !$cursor) || !markApplies(state.doc, ranges, type)) {
        return false;
      }
      if (dispatch) {
        if ($cursor) {
          const found = type.isInSet(state.storedMarks || $cursor.marks());
          if (found) {
            for (const name in options) {
              if (found.attrs[name]) {
                options[name] = "";
              }
            }
            const tr = state.tr;
            tr.removeStoredMark(type);
            tr.addStoredMark(
              type.create({
                ...found.attrs,
                ...options
              })
            );
            dispatch(tr);
          } else {
            dispatch(state.tr.addStoredMark(type.create(options)));
          }
        } else {
          let found: null | ProseMirrorMark = null;
          const tr = state.tr;
          for (let i = 0; !found && i < ranges.length; i++) {
            const { $from, $to } = ranges[i];
            state.doc.nodesBetween($from.pos, $to.pos, node => {
              const mark = type.isInSet(node.marks);
              if (mark) {
                found = mark;
              }
              return !found;
            });
          }
          for (let i = 0; i < ranges.length; i++) {
            const { $from, $to } = ranges[i];
            if (found) {
              for (const name in options) {
                if (found.attrs[name]) {
                  options[name] = "";
                }
              }
              tr.removeMark($from.pos, $to.pos, type);
              tr.addMark(
                $from.pos,
                $to.pos,
                type.create({
                  // @ts-ignore
                  ...found.attrs,
                  ...options
                })
              );
            } else {
              tr.addMark($from.pos, $to.pos, type.create(options));
            }
          }
          dispatch(tr.scrollIntoView());
        }
      }
      return true;
    };
  }

  inputRules({ type, schema }: { type: MarkType; schema: Schema }): any[] {
    return [markInputRule(/\[([^\]]+)]{([^}]+)}$/, type, 1, getStyleAttrs)];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [markPasteRule(/\[([^\]]+)]{([^}]+)}$/, type, 1, getStyleAttrs)];
  }
}
