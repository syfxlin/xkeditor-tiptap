declare module "tiptap" {
  import {
    MarkSpec,
    MarkType,
    Node as ProsemirrorNode,
    NodeSpec,
    NodeType,
    ParseOptions,
    Schema
  } from "prosemirror-model";
  import {
    EditorState,
    Plugin,
    Selection,
    Transaction
  } from "prosemirror-state";
  import { Command, CommandFunction } from "tiptap-commands";
  import { EditorProps, EditorView } from "prosemirror-view";
  import { Component, VueConstructor } from "vue";
  import { defineComponent } from "vue-demi";
  export type VueComponent = ReturnType<typeof defineComponent> | Component;

  export const EditorContent: VueConstructor;
  export const EditorMenuBubble: VueConstructor;
  export const EditorMenuBar: VueConstructor;
  export const EditorFloatingMenu: VueConstructor;
  export type ExtensionOption = Extension | Node | Mark;

  // there are some props available
  // `node` is a Prosemirror Node Object
  // `updateAttrs` is a function to update attributes defined in `schema`
  // `view` is the ProseMirror view instance
  // `options` is an array of your extension options
  // `selected`
  export interface NodeView {
    /** A Prosemirror Node Object */
    node?: ProsemirrorNode;
    /** A function to update attributes defined in `schema` */
    updateAttrs?: (attrs: { [key: string]: any }) => any;
    /** The ProseMirror view instance */
    view?: EditorView;
    /** An array of your extension options */
    options?: { [key: string]: any };
    /** Whether the node view is selected */
    selected?: boolean;
  }

  export type CommandGetter =
    | { [key: string]: (() => Command) | Command }
    | (() => Command)
    | Command
    | (() => Command)[];

  export interface EditorUpdateEvent {
    state: EditorState;
    getHTML: () => string;
    getJSON: () => object;
    transaction: Transaction;
  }

  export interface EditorOptions {
    editorProps?: EditorProps;
    /** defaults to true */
    editable?: boolean;
    /** defaults to false */
    autoFocus?: boolean;
    extensions?: ExtensionOption[];
    content?: Record<string, any> | string;
    emptyDocument?: {
      type: "doc";
      content: [
        {
          type: "paragraph";
        }
      ];
    };
    /** defaults to false */
    useBuiltInExtensions?: boolean;
    /** defaults to false */
    disableInputRules?: boolean;
    /** defaults to false */
    disablePasteRules?: boolean;
    dropCursor?: {};
    parseOptions?: ParseOptions;
    /** defaults to true */
    injectCSS?: boolean;
    onInit?: ({
      view,
      state
    }: {
      view: EditorView;
      state: EditorState;
    }) => void;
    onTransaction?: (event: EditorUpdateEvent) => void;
    onUpdate?: (event: EditorUpdateEvent) => void;
    onFocus?: ({
      event,
      state,
      view
    }: {
      event: FocusEvent;
      state: EditorState;
      view: EditorView;
    }) => void;
    onBlur?: ({
      event,
      state,
      view
    }: {
      event: FocusEvent;
      state: EditorState;
      view: EditorView;
    }) => void;
    onPaste?: (...args: any) => void;
    onDrop?: (...args: any) => void;
  }

  export class ExtensionManager {
    nodes: NodeSpec[];
    marks: MarkSpec[];
    plugins: Plugin[];
    options: { [key: string]: any };
    extensions: (Extension | Mark | Node)[];
    view: EditorView;
  }

  export class Editor {
    commands: { [key: string]: Command };
    isActive: { [key: string]: (attrs?: { [key: string]: any }) => boolean };
    defaultOptions: { [key: string]: any };
    element: Element;
    extensions: ExtensionManager;
    inputRules: any[];
    keymaps: any[];
    marks: MarkSpec[];
    nodes: NodeSpec[];
    pasteRules: any[];
    plugins: Plugin[];
    schema: Schema;
    state: EditorState;
    view: EditorView;
    selection: Selection;
    activeMarks: { [markName: string]: () => boolean };
    activeNodes: { [nodeName: string]: () => boolean };
    activeMarkAttrs: { [markName: string]: { [attr: string]: any } };

    /**
     * Creates an [Editor]
     * @param options - An object of Editor options.
     */
    constructor(options?: EditorOptions);

    /**
     * Replace the current content. You can pass an HTML string or a JSON document that matches the editor's schema.
     * @param content Defaults to {}.
     * @param emitUpdate Defaults to false.
     */
    setContent(content?: string | object, emitUpdate?: boolean): void;

    /**
     * Clears the current editor content.
     *
     * @param emitUpdate Whether or not the change should trigger the onUpdate callback.
     */
    clearContent(emitUpdate?: boolean): void;

    /**
     * Overwrites the current editor options.
     * @param options Options an object of Editor options
     */
    setOptions(options: EditorOptions): void;

    /**
     * Register a ProseMirror plugin.
     * @param plugin
     */
    registerPlugin(plugin: Plugin): void;

    /** Get the current content as JSON. */
    getJSON(): {};

    /** Get the current content as HTML. */
    getHTML(): string;

    /** Focus the editor */
    focus(): void;

    /** Removes the focus from the editor. */
    blur(): void;

    /** Destroy the editor and free all Prosemirror-related objects from memory.
     * You should always call this method on beforeDestroy() lifecycle hook of the Vue component wrapping the editor.
     */
    destroy(): void;

    on(event: string, callbackFn: (params: any) => void): void;

    off(event: string, callbackFn: (params: any) => void): void;

    getMarkAttrs(markName: string): { [attributeName: string]: any };

    dispatchTransaction(tr: Transaction): void;
  }

  export class Extension<Options = any> {
    /** Define a name for your extension */
    name?: string | null;
    /** Define some default options.The options are available as this.$options. */
    defaultOptions?: Options;
    /** Define a list of Prosemirror plugins. */
    plugins?: Plugin[];
    /** Called when options of extension are changed via editor.extensions.options */
    // update?: (view: EditorView) => any;
    /** Options for that are either passed in from the extension constructor or set by defaultOptions() */
    options?: Options;

    constructor(options?: Options);

    /** Define some keybindings. */
    keys?({
      schema
    }: {
      schema: Schema;
    }): { [keyCombo: string]: CommandFunction };

    /** Define commands. */
    commands?({
      schema,
      attrs
    }: {
      schema: Schema;
      attrs: { [key: string]: string };
    }): CommandGetter;

    inputRules?({ schema }: { schema: Schema }): any[];

    pasteRules?({ schema }: { schema: Schema }): Plugin[];

    setSelection?(anchor: number, head: number, root: Document): void;
  }

  export class Node<V extends NodeView = any> extends Extension {
    schema?: NodeSpec;
    /** Reference to a view component constructor
     *  See https://stackoverflow.com/questions/38311672/generic-and-typeof-t-in-the-parameters
     */
    view?: { new (): V } | VueComponent;

    commands?({
      type,
      schema,
      attrs
    }: {
      type: NodeType;
      schema: Schema;
      attrs: { [key: string]: string };
    }): CommandGetter;

    keys?({
      type,
      schema
    }: {
      type: NodeType;
      schema: Schema;
    }): { [keyCombo: string]: CommandFunction };

    inputRules?({ type, schema }: { type: NodeType; schema: Schema }): any[];

    pasteRules?({ type, schema }: { type: NodeType; schema: Schema }): Plugin[];
  }

  export class Mark<V extends NodeView = any> extends Extension {
    schema?: MarkSpec;
    /** Reference to a view component constructor
     *  See https://stackoverflow.com/questions/38311672/generic-and-typeof-t-in-the-parameters
     */
    view?: { new (): V } | VueComponent;

    commands?({
      type,
      schema,
      attrs
    }: {
      type: MarkType;
      schema: Schema;
      attrs: { [key: string]: string };
    }): CommandGetter;

    keys?({
      type,
      schema
    }: {
      type: MarkType;
      schema: Schema;
    }): { [keyCombo: string]: CommandFunction };

    inputRules?({ type, schema }: { type: MarkType; schema: Schema }): any[];

    pasteRules?({ type, schema }: { type: MarkType; schema: Schema }): Plugin[];
  }

  export class Text extends Node {}

  export class Paragraph extends Node {}

  export class Doc extends Node {}

  /** A set of commands registered to the editor. */
  export interface EditorCommandSet {
    [key: string]: Command;
  }

  /**
   * The properties passed into <editor-menu-bar /> component
   */
  export interface MenuData {
    /** Whether the editor has focus. */
    focused: boolean;
    /** Function to focus the editor. */
    focus: () => void;
    /** A set of commands registered. */
    commands: EditorCommandSet;
    /** Check whether a node or mark is currently active. */
    isActive: IsActiveChecker;
    /** A function to get all mark attributes of the current selection.  */
    getMarkAttrs: (markName: string) => { [attributeName: string]: any };
  }

  export interface FloatingMenuData extends MenuData {
    /** An object for positioning the menu. */
    menu: MenuDisplayData;
  }

  /**
   * A data object passed to a menu bubble to help it determine its position
   * and visibility.
   */
  export interface MenuDisplayData {
    /** Left position of the cursor. */
    left: number;
    /** Bottom position of the cursor. */
    bottom: number;
    /** Whether or not there is an active selection. */
    isActive: boolean;
  }

  /**
   * A map containing functions to check if a node/mark is currently selected.
   * The name of the node/mark is used as the key.
   */
  export interface IsActiveChecker {
    [name: string]: () => boolean;
  }
}
