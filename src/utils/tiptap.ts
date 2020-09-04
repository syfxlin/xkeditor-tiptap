import Iframe from "@/block/nodes/Iframe";
import {
  Bold,
  Code,
  CodeBlock,
  Collaboration,
  Focus,
  HardBreak,
  History,
  Italic,
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
import CodeBlockHighlight from "@/block/nodes/CodeBlockHighlight";
import Style from "@/block/marks/Style";
import Emoji from "@/block/extensions/Emoji";
import { Fragment } from "@/utils/prosemirror";
import Heading from "@/block/nodes/Heading";
import Blockquote from "@/block/nodes/Blockquote";
import Image from "@/block/nodes/Image";
import HorizontalRule from "@/block/nodes/HorizontalRule";
import BulletList from "@/block/nodes/BulletList";
import OrderedList from "@/block/nodes/OrderedList";
import TodoList from "@/block/nodes/TodoList";
import Katex from "@/block/nodes/Katex";
import Mermaid from "@/block/nodes/Mermaid";
import Toc from "@/block/nodes/Toc";
import Details from "@/block/nodes/Details";
import Table from "@/block/nodes/Table";
import Sup from "@/block/marks/Sup";
import Sub from "@/block/marks/Sub";
import ExitMark from "@/block/extensions/ExitMark";
import Link from "@/block/marks/Link";
import CardLink from "@/block/marks/CardLink";
import ListItem from "@/block/nodes/ListItem";

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
  "listItem",

  "hardBreak",
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
