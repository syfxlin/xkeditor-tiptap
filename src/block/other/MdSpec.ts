// TODO: 未完成
import { MdParseRule } from "@/block/other/MarkdownParser";
import { MdSerializerRule } from "@/block/other/MarkdownSerializer";

export interface MdSpec {
  toMarkdown?: MdSerializerRule;
  parseMarkdown?: MdParseRule[];
}
