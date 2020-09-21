import { Slugger } from "marked";

export default class MdSlugger extends Slugger {
  slug(value: string): string {
    return (
      value
        .toLowerCase()
        .trim()
        // remove html tags
        // eslint-disable-next-line no-useless-escape
        .replace(/<[!\/a-z].*?>/gi, "")
        // remove unwanted chars
        .replace(
          /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,
          ""
        )
        .replace(/\s/g, "-")
    );
  }

  static slug(value: string) {
    return new MdSlugger().slug(value);
  }
}
