import IframeNode from "@/block/IFrameNode";
import CodeMirrorNode from "@/block/CodeMirrorNode";
import {
  Blockquote,
  Bold,
  BulletList,
  Code,
  CodeBlock,
  Collaboration,
  Focus,
  HardBreak,
  Heading,
  History,
  HorizontalRule,
  Image,
  Italic,
  Link,
  ListItem,
  Mention,
  OrderedList,
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

const EXTENSIONS = {
  blockquote: Blockquote,
  codeBlock: CodeBlock,
  hardBreak: HardBreak,
  heading: Heading,
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

  color: ColorMark,
  iframe: IframeNode,
  codeMirror: CodeMirrorNode,
  codeBlockHighlight: CodeBlockHighlight
};

const DEFAULT_EXTENSION_CONFIG: { [key in ExtensionNames]?: any } = {
  heading: { levels: [1, 2, 3] }
};

const DEFAULT_EXTENSIONS = [
  "blockquote",
  "hardBreak",
  "heading",
  "bulletList",
  "orderedList",
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
  "image",
  "horizontalRule",
  "mention",
  "placeholder",
  "search",
  "table",
  "tableCell",
  "tableHeader",
  "tableRow",
  "trailing",

  "iframe",
  "codeMirror",
  // "codeBlockHighlight",
  "color"
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
