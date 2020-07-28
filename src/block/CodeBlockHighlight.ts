import { CommandGetter, Node } from "tiptap";
import {
  CommandFunction,
  setBlockType,
  textblockTypeInputRule,
  toggleBlockType
} from "tiptap-commands";
import { NodeSpec, NodeType, Schema } from "prosemirror-model";
import HighlightPlugin from "@/block/Highlight";
import "highlight.js/styles/solarized-dark.css";

export default class CodeBlockHighlight extends Node {
  get name() {
    return "code_block";
  }

  get defaultOptions() {
    return {
      languages: {}
    };
  }

  get schema(): NodeSpec {
    return {
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
      toDOM: () => ["pre", ["code", 0]]
    };
  }

  get view() {
    return {
      template: `
      <template><pre><code ref="content"></code></pre></template>
      `
    };
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: NodeType;
    schema: NodeSpec;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return () => toggleBlockType(type, schema.nodes.paragraph);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: NodeSpec;
  }): { [p: string]: CommandFunction } {
    return {
      "Shift-Ctrl-\\": setBlockType(type)
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [textblockTypeInputRule(/^```$/, type)];
  }

  get plugins() {
    return [HighlightPlugin({ name: this.name })];
  }
}
