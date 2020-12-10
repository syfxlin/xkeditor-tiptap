import { state, XkEditorConfig, XkEditorMode } from "./state";
import deepAssign from "@/utils/deepAssign";
import { Editor as Tiptap, EditorOptions as TiptapConfig } from "tiptap";
import { useExtensions } from "@/utils/tiptap";
import { NodeMdParser } from "@/marked/NodeMdParser";
import { TextSelection } from "@/utils/prosemirror";
import { NodeMdSerializer } from "@/marked/NodeMdSerializer";
import { Ace, config as aceConfig, edit as aceEdit } from "ace-builds";
import MdParser from "@/marked/MdParser";
import { MdLexer } from "@/marked/MdLexer";
import allCommands from "@/marked/commands";
import { computed, ComputedRef } from "vue-demi";
import AceConfig = Ace.EditorOptions;

export interface Command {
  handler: (options?: any) => void;
  isActive: (options?: any) => ComputedRef<boolean>;
}

export const actions = {
  initConfig(config?: Partial<XkEditorConfig>): XkEditorConfig {
    state.config = deepAssign(state.config, config);
    return state.config;
  },
  createTiptap(config: TiptapConfig) {
    state.tiptap = new Tiptap({
      extensions: useExtensions(),
      ...config
    });
    return state.tiptap;
  },
  createAce(el: HTMLElement, config: Partial<AceConfig>) {
    aceConfig.set(
      "basePath",
      "https://cdn.jsdelivr.net/npm/ace-builds@1.4.4/src-noconflict/"
    );
    state.ace = aceEdit(el, {
      minLines: 10,
      ...config
    });
    return state.ace;
  },
  setMarkdown(markdown: string, emitUpdate = false) {
    if (state.mode === XkEditorMode.RichText) {
      const editor = state.tiptap;
      if (editor) {
        const document: any = new NodeMdParser(editor.extensions).parse(
          markdown
        );
        const { doc, tr } = editor.state;
        const selection = TextSelection.create(doc, 0, doc.content.size);
        const transaction = tr
          .setSelection(selection)
          .replaceSelectionWith(document, false)
          .setMeta("preventUpdate", !emitUpdate);

        editor.view.dispatch(transaction);
        return true;
      }
    } else {
      const editor = state.ace;
      if (editor) {
        editor.setValue(markdown);
        return true;
      }
    }
    return false;
  },
  getMarkdown() {
    if (state.mode === XkEditorMode.RichText) {
      const editor = state.tiptap;
      if (editor) {
        return new NodeMdSerializer(editor.extensions).serialize(
          editor.state.doc
        );
      }
    } else {
      const editor = state.ace;
      if (editor) {
        return editor.getValue();
      }
    }
    return "";
  },
  switchMode(mode?: XkEditorMode) {
    if (!mode) {
      mode =
        state.mode === XkEditorMode.RichText
          ? XkEditorMode.Markdown
          : XkEditorMode.RichText;
    }
    const value = this.getMarkdown();
    state.mode = mode;
    this.setMarkdown(value);
    return state.mode;
  },
  setConfig(config: Partial<XkEditorConfig>): XkEditorConfig {
    state.config = deepAssign(state.config, config);
    if (state.tiptap) {
      state.tiptap.setOptions(state.config.tiptap);
    }
    if (state.ace) {
      state.ace.setOptions(state.config.ace);
    }
    return state.config;
  },
  getConfig() {
    return state.config;
  },
  convertMarkdownToHtml(markdown: string) {
    if (state.tiptap) {
      return new MdParser(state.tiptap.extensions).parse(
        new MdLexer().lex(markdown)
      );
    }
    return "";
  },
  getCommand(command: string): Command {
    return {
      handler: attrs => {
        if (state.mode === XkEditorMode.RichText) {
          if (state.tiptap) {
            return state.tiptap.commands[command](attrs);
          }
        } else {
          if (state.ace) {
            return allCommands[command].handler(attrs)(state.ace);
          }
        }
        throw new Error("Editor has not been created");
      },
      isActive: attrs =>
        computed(() => {
          if (state.mode === XkEditorMode.RichText) {
            if (state.tiptap) {
              return state.tiptap.isActive[command](attrs);
            }
          } else {
            if (state.ace) {
              const active = allCommands[command].isActive;
              if (active) {
                return active(attrs)(state.ace);
              } else {
                return false;
              }
            }
          }
          return false;
        })
    };
  },
  execCommand(command: string, options: any) {
    return this.getCommand(command).handler(options);
  }
};

export type Actions = typeof actions;
