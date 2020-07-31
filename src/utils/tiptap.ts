import IframeNode from "@/block/IFrameNode";
import CodeMirrorNode from "@/block/CodeMirrorNode";
import {
  Bold,
  Code,
  CodeBlock,
  Collaboration,
  Focus,
  HardBreak,
  History,
  Italic,
  Link,
  ListItem,
  Mention,
  Placeholder,
  Search,
  Strike,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  TodoItem,
  TodoList,
  TrailingNode,
  Underline
} from "tiptap-extensions";
import { ExtensionOption } from "tiptap";
import CodeBlockHighlight from "@/block/CodeBlockHighlight";
import ColorMark from "@/block/ColorMark";
import EmojiExtension from "@/block/EmojiExtension";
import { Fragment } from "@/utils/prosemirror";
import Heading from "@/block/Heading";
import Blockquote from "@/block/Blockquote";
import Image from "@/block/Image";
import HorizontalRule from "@/block/HorizontalRule";
import BulletList from "@/block/BulletList";
import OrderedList from "@/block/OrderedList";

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

  // change
  heading: Heading,

  // custom
  color: ColorMark,
  iframe: IframeNode,
  codeMirror: CodeMirrorNode,
  codeBlockHighlight: CodeBlockHighlight,
  emoji: EmojiExtension,
  blockquote: Blockquote
};

const DEFAULT_EXTENSION_CONFIG: { [key in ExtensionNames]?: any } = {
  heading: { levels: [1, 2, 3] }
};

const DEFAULT_EXTENSIONS = [
  // TODO: 预先定义加载顺序
  "horizontalRule",
  "iframe",
  "codeMirror",
  // "codeBlockHighlight",
  "color",
  "emoji",
  "blockquote", // 在 blockquote 中使用 heading，heading 就必须先解析
  "heading",
  "image",
  "bulletList",
  "orderedList",

  "hardBreak",
  "listItem",
  "todoItem",
  "todoList",
  "bold",
  "code",
  "italic",
  "link",
  "strike",
  "underline",
  "history",
  "collaboration",
  "focus",
  "mention",
  "placeholder",
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
