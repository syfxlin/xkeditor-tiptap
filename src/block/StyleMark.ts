import { CommandGetter, Mark } from "tiptap";
import { MarkSpec, MarkType, Plugin, Schema } from "@/utils/prosemirror";
import { CommandFunction, toggleMark } from "tiptap-commands";
// @ts-ignore
import addPx from "add-px-to-style";
// @ts-ignore
import hyphenate from "hyphenate-style-name";
import markInputRule from "@/utils/markInputRule";
import markPasteRule from "@/utils/markPasteRule";

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
  DEFAULT_STYLE_ATTRS[key] = {
    default: value
  };
}

const convertCssObjToStr = (style: { [key: string]: any }) => {
  let result = "";
  for (const [key, value] of Object.entries(style)) {
    if (value === "") {
      continue;
    }
    result += hyphenate(key) + ":" + addPx(key, value) + ";";
  }
  return result;
};

const getColorAttrs = (match: string[]) => {
  if (match[2].indexOf(",") !== -1) {
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

export default class StyleMark extends Mark {
  get name() {
    return "style";
  }

  get schema(): MarkSpec {
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
        const style = convertCssObjToStr(mark.attrs);
        return ["span", { style }, 0];
      }
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
    return options =>
      toggleMark(type, {
        color: options.color || "",
        background: options.background || ""
      });
  }

  inputRules({ type, schema }: { type: MarkType; schema: Schema }): any[] {
    return [markInputRule(/\[([^\]]+)]{([^}]+)}$/, type, 1, getColorAttrs)];
  }

  pasteRules({ type, schema }: { type: MarkType; schema: Schema }): Plugin[] {
    return [markPasteRule(/\[([^\]]+)]{([^}]+)}$/, type, 1, getColorAttrs)];
  }
}
