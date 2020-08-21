import Iframe from "@/block/Iframe";
import {
  Bold,
  Code,
  CodeBlock,
  Collaboration,
  Focus,
  HardBreak,
  History,
  Italic,
  ListItem,
  Mention,
  Placeholder,
  Search,
  Strike,
  TableCell,
  TableHeader,
  TableRow,
  TodoItem,
  TrailingNode,
  Underline
} from "tiptap-extensions";
import { ExtensionOption } from "tiptap";
import CodeBlockHighlight from "@/block/CodeBlockHighlight";
import Style from "@/block/Style";
import Emoji from "@/block/Emoji";
import { Fragment } from "@/utils/prosemirror";
import Heading from "@/block/Heading";
import Blockquote from "@/block/Blockquote";
import Image from "@/block/Image";
import HorizontalRule from "@/block/HorizontalRule";
import BulletList from "@/block/BulletList";
import OrderedList from "@/block/OrderedList";
import TodoList from "@/block/TodoList";
import Katex from "@/block/Katex";
import Mermaid from "@/block/Mermaid";
import Toc from "@/block/Toc";
import Details from "@/block/Details";
import Table from "@/block/Table";
import Sup from "@/block/Sup";
import Sub from "@/block/Sub";
import ExitMark from "@/block/ExitMark";
import Link from "@/block/Link";
import CardLink from "@/block/CardLink";

const EXTENSIONS = {
  codeBlock: CodeBlock,
  hardBreak: HardBreak,
  bulletList: BulletList,
  orderedList: OrderedList,
  listItem: ListItem,
  todoItem: TodoItem,
  todoList: TodoList,
  bold: Bold,
  code: Code,
  italic: Italic,
  link: Link,
  strike: Strike,
  underline: Underline,
  history: History,
  collaboration: Collaboration,
  focus: Focus,
  image: Image,
  horizontalRule: HorizontalRule,
  mention: Mention,
  placeholder: Placeholder,
  search: Search,
  table: Table,
  tableCell: TableCell,
  tableHeader: TableHeader,
  tableRow: TableRow,
  trailing: TrailingNode,
  heading: Heading,

  // custom
  style: Style,
  iframe: Iframe,
  codeBlockHighlight: CodeBlockHighlight,
  emoji: Emoji,
  blockquote: Blockquote,
  katex: Katex,
  mermaid: Mermaid,
  toc: Toc,
  details: Details,
  sup: Sup,
  sub: Sub,
  exitMark: ExitMark,
  cardLink: CardLink
};

const DEFAULT_EXTENSION_CONFIG: { [key in ExtensionNames]?: any } = {
  heading: { levels: [1, 2, 3] },
  todoItem: { nested: true }
};

const DEFAULT_EXTENSIONS = [
  // TODO: 预先定义加载顺序
  "heading",
  "horizontalRule",
  "iframe",
  "codeBlockHighlight",
  "style",
  "emoji",
  "blockquote", // 在 blockquote 中使用 heading，heading 就必须先解析
  "image",
  "bulletList",
  "orderedList",
  "todoList",
  "katex",
  "mermaid",
  "toc",
  "details",
  "sup",
  "sub",
  "exitMark",
  "link",
  "cardLink",

  "hardBreak",
  "listItem",
  "todoItem",
  "bold",
  "code",
  "italic",
  "strike",
  "underline",
  "history",
  "collaboration",
  // "focus",
  // "mention",
  // "placeholder",
  "search",
  "table",
  "tableCell",
  "tableHeader",
  "tableRow",

  "trailing"
];

type ExtensionNames = keyof typeof EXTENSIONS;

type ExtensionConfigs = { [key in ExtensionNames]?: any };

function convertExtStringToConfig(configNames: string[]): ExtensionConfigs {
  const configs: ExtensionConfigs = {};
  for (const configName of configNames) {
    // @ts-ignore
    if (EXTENSIONS[configName] !== undefined) {
      // @ts-ignore
      if (DEFAULT_EXTENSION_CONFIG[configName] !== undefined) {
        // @ts-ignore
        configs[configName] = DEFAULT_EXTENSION_CONFIG[configName];
      } else {
        // @ts-ignore
        configs[configName] = undefined;
      }
    }
  }
  return configs;
}

export function useExtensions(
  configs?: string[] | ExtensionConfigs
): ExtensionOption[] {
  if (configs === undefined) {
    configs = DEFAULT_EXTENSIONS;
  }
  if (configs instanceof Array) {
    configs = convertExtStringToConfig(configs);
  }
  const extensions: ExtensionOption[] = [];
  for (const configName in configs) {
    // @ts-ignore
    extensions.push(new EXTENSIONS[configName](configs[configName]));
  }
  return extensions;
}

export function fragToContent(fragment: Fragment) {
  let content = "";

  fragment.forEach(child => {
    if (child.isText) {
      content += child.text;
    } else {
      content += fragToContent(child.content) + "\n";
    }
  });

  return content;
}
