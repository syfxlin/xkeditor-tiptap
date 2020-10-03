import { createState } from "@/store/hook";
import { Editor as Tiptap, EditorOptions as TiptapConfig } from "tiptap";
import { Ace } from "ace-builds";
import AceConfig = Ace.EditorOptions;
import AceEditor = Ace.Editor;

export interface XkEditorConfig {
  tiptap: TiptapConfig;
  ace: Partial<AceConfig>;
  xk: {
    [key: string]: any;
  };
}

export enum XkEditorMode {
  RichText = "rich-text",
  Markdown = "markdown"
}

const initialState: {
  config: XkEditorConfig;
  tiptap: null | Tiptap;
  ace: null | AceEditor;
  mode: XkEditorMode;
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
    xk: {}
  },
  tiptap: null,
  ace: null,
  mode: XkEditorMode.RichText
};

export const state = createState(initialState);
export type State = typeof initialState;
