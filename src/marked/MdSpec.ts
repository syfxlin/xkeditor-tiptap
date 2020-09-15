// TODO: 未完成
import { MdParseRule } from "@/marked/NodeMdParser";
import { MdSerializerRule } from "@/marked/NodeMdSerializer";

export interface MdSpec {
  toMarkdown?: MdSerializerRule;
  parseMarkdown?: MdParseRule[];
}
