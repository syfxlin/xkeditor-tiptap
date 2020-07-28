declare module "tiptap-commands" {
  import { EditorView } from "prosemirror-view";
  import { EditorState, Plugin, Transaction } from "prosemirror-state";
  import { InputRule } from "prosemirror-inputrules";
  import { MarkType, NodeType } from "prosemirror-model";

  type GetAttrs = (() => { [key: string]: any }) | { [key: string]: any };

  export {
    chainCommands,
    deleteSelection,
    joinBackward,
    selectNodeBackward,
    joinForward,
    selectNodeForward,
    joinUp,
    joinDown,
    lift,
    newlineInCode,
    exitCode,
    createParagraphNear,
    liftEmptyBlock,
    splitBlock,
    splitBlockKeepMarks,
    selectParentNode,
    selectAll,
    wrapIn,
    setBlockType,
    toggleMark,
    autoJoin,
    baseKeymap,
    pcBaseKeymap,
    macBaseKeymap
  } from "prosemirror-commands";

  export {
    addListNodes,
    wrapInList,
    splitListItem,
    liftListItem,
    sinkListItem
  } from "prosemirror-schema-list";

  export {
    wrappingInputRule,
    textblockTypeInputRule
  } from "prosemirror-inputrules";

  export interface DispatchFn {
    (tr: Transaction): boolean;
  }

  export interface Command {
    (...params: any[]): CommandFunction;
  }

  export interface CommandFunction {
    (
      state: EditorState,
      dispatch: DispatchFn | undefined,
      view: EditorView
    ): boolean;
  }

  export function insertText(text: string): CommandFunction;

  export function markInputRule(regexp: RegExp, markType: MarkType): InputRule;

  export function markInputRule(
    regexp: RegExp,
    markType: MarkType,
    getAttrs: Function
  ): InputRule;

  export function markPasteRule(
    regexp: RegExp,
    type: MarkType | NodeType
  ): Plugin;

  export function markPasteRule(
    regexp: RegExp,
    type: MarkType | NodeType,
    getAttrs: Function
  ): Plugin;

  export function nodeInputRule(
    regexp: RegExp,
    type: MarkType | NodeType
  ): InputRule;

  export function nodeInputRule(
    regexp: RegExp,
    type: MarkType | NodeType,
    getAttrs: GetAttrs
  ): InputRule;

  export function removeMark(type: MarkType | NodeType): CommandFunction;

  export function toggleWrap(type: NodeType): Command;

  export function pasteRule(regexp: RegExp, type: MarkType | NodeType): Plugin;

  export function pasteRule(
    regexp: RegExp,
    type: MarkType | NodeType,
    getAttrs: GetAttrs
  ): Plugin;

  export function toggleBlockType(
    type: MarkType | NodeType,
    toggletype: MarkType | NodeType
  ): CommandFunction;

  export function toggleBlockType(
    type: MarkType | NodeType,
    toggletype: MarkType | NodeType,
    attrs: { [key: string]: any }
  ): CommandFunction;
}
