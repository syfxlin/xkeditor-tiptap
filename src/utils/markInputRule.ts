import { InputRule, MarkType } from "@/utils/prosemirror";

export default function(
  regexp: RegExp,
  markType: MarkType,
  getContent: ((match: string[]) => string) | string | number = 1,
  getAttrs:
    | ((match: string[]) => { [attr: string]: any })
    | { [attr: string]: any } = {}
) {
  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state;
    const markStart = start;
    let markEnd = end;

    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;

    if (match && match.length > 1) {
      let content;
      if (getContent instanceof Function) {
        content = getContent(match);
      } else if (typeof getContent === "string") {
        content = getContent;
      } else {
        content = match[getContent];
      }
      const textStart = markStart + match[0].indexOf(content);
      const textEnd = textStart + content.length;

      if (textEnd < markEnd) {
        tr.delete(textEnd, markEnd);
        markEnd = textEnd;
      }
      if (textStart > markStart) {
        tr.delete(markStart, textStart);
        markEnd -= textStart - markStart;
      }
    }

    tr.addMark(markStart, markEnd, markType.create(attrs));
    tr.removeStoredMark(markType);
    return tr;
  });
}
