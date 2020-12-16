import { createState } from "@/store/hook";
import { Editor as Tiptap, EditorOptions as TiptapConfig } from "tiptap";
import { Ace } from "ace-builds";
import AceConfig = Ace.EditorOptions;
import AceEditor = Ace.Editor;

export interface XkEditorConfig {
  tiptap: TiptapConfig;
  ace: Partial<AceConfig>;
  xk: XkConfig;
}

export enum XkEditorMode {
  RichText = "rich-text",
  Markdown = "markdown"
}

export interface PopoverProps {
  ref: null | undefined | Element;
  active?: boolean;
  command: null | string;
  data?: {
    [key: string]: any;
  };
  buttons: {
    label: string;
    handler: (props: PopoverProps) => void;
    type: string;
    loading?: boolean;
  }[];
}

export interface XkConfig {
  uploadImage?: string;
  [key: string]: any;
}

const initialState: {
  config: XkEditorConfig;
  tiptap: null | Tiptap;
  ace: null | AceEditor;
  mode: XkEditorMode;
  popover: PopoverProps;
  [key: string]: any;
} = {
  config: {
    tiptap: {},
    ace: {
      fontSize: 17,
      theme: "ace/theme/solarized_light",
      mode: "ace/mode/markdown",
      tabSize: 4,
      wrap: true
    },
    xk: {
      uploadImage: "http://localhost/upload.php"
    }
  },
  tiptap: null,
  ace: null,
  mode: XkEditorMode.RichText,
  popover: {
    ref: null,
    active: false,
    command: null,
    data: {},
    buttons: []
  }
};

export const state = createState(initialState);
export type State = typeof initialState;
