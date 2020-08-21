import { MarkType, NodeType, Plugin, Schema } from "@/utils/prosemirror";
// @ts-ignore
import { getMarkAttrs } from "tiptap-utils";

export default function LinkPlugin(
  openOnClick: boolean,
  type: (schema: Schema) => MarkType | NodeType,
  open: (attrs: { [key: string]: any }) => void
) {
  return new Plugin({
    props: {
      handleClick: (view, pos, event) => {
        const { schema } = view.state;
        const attrs = getMarkAttrs(view.state, type(schema));

        if (attrs.href && event.target instanceof HTMLAnchorElement) {
          if (openOnClick || event.ctrlKey) {
            event.stopPropagation();
            open(attrs);
            return true;
          }
        }
        return false;
      }
    }
  });
}
