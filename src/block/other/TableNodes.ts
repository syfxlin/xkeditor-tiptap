import { tableNodes } from "@/utils/prosemirror";

export default tableNodes({
  tableGroup: "block",
  cellContent: "block+",
  cellAttributes: {
    background: {
      default: null,
      getFromDOM(dom) {
        return (dom as HTMLElement).style.backgroundColor || null;
      },
      setDOMAttr(value, attrs) {
        if (value) {
          const style = {
            style: `${attrs.style || ""}background-color: ${value};`
          };
          Object.assign(attrs, style);
        }
      }
    }
  }
});
