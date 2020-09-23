import { CommandGetter, Editor as TipTapEditor, Node } from "tiptap";
import {
  CommandFunction,
  setBlockType,
  textblockTypeInputRule,
  toggleBlockType
} from "tiptap-commands";
import {
  Node as ProsemirrorNode,
  NodeSpec,
  NodeType,
  Plugin,
  Schema
} from "@/utils/prosemirror";
import { computed, defineComponent, nextTick, ref } from "vue-demi";
import { dirFocus, mergeNodeSpec, nodeKeys } from "@/utils/ace";
import HighlightComponent from "@/block/other/HighlightComponent.vue";
import AceComponent from "@/block/other/AceComponent.vue";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/plugins/toolbar/prism-toolbar.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import nodeListPasteRule, { Matched } from "@/utils/nodeListPasteRule";
import { MdSpec } from "@/marked/MdSpec";
import { Tokens } from "@/marked/MdLexer";

export default class CodeBlockHighlight extends Node {
  get name() {
    return "code_block";
  }

  get schema(): NodeSpec & MdSpec {
    return mergeNodeSpec({
      attrs: {
        language: {
          default: null
        },
        isEditing: {
          default: false
        }
      },
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
          contentElement: node => {
            const dom = node as HTMLPreElement;
            if (
              dom.children.length === 1 &&
              dom.children[0].tagName.toLowerCase() === "code"
            ) {
              return dom.children[0];
            }
            return dom;
          },
          getAttrs: node => {
            const dom = node as HTMLElement;
            let language = dom.getAttribute("data-language");
            if (language === null) {
              language = dom.getAttribute("language");
            }
            if (language === null) {
              const match = dom.className.match(/lang(uage|)[-_]([^ ]+)/);
              if (match && match.length > 2) {
                language = match[2];
              }
            }
            return {
              language
            };
          }
        }
      ],
      toDOM: node => [
        "pre",
        { "data-language": node.attrs.language },
        ["code", 0]
      ],
      parseMarkdown: [
        {
          type: "code",
          getAttrs: token => ({
            language: (token as Tokens.Code).lang
          }),
          getContent: token => (token as Tokens.Code).text
        }
      ],
      toMarkdown: (node, serializer) =>
        `\`\`\`${node.attrs.language}\n${node.textContent}\n\`\`\``
    });
  }

  get view() {
    return defineComponent({
      name: "node_code_block",
      components: {
        HighlightComponent,
        AceComponent
      },
      props: {
        node: ProsemirrorNode,
        updateAttrs: Function,
        view: Object,
        options: Object,
        selected: Boolean,
        editor: TipTapEditor,
        getPos: Function,
        decorations: Array
      },
      setup(props) {
        const content = ref<HTMLElement>();
        const edit = () => {
          if (props.updateAttrs) {
            props.updateAttrs({
              isEditing: true
            });
            nextTick(() => {
              dirFocus(props.node?.attrs.cmRef, 1);
            });
          }
        };

        const blur = () => {
          if (props.updateAttrs) {
            props.updateAttrs({
              isEditing: false
            });
          }
        };

        const lines = computed(
          () => props.node?.textContent.split("\n").length
        );

        const code = computed({
          get: () => props.node?.textContent,
          set: v => {
            if (content.value !== undefined) {
              content.value.textContent = v === undefined ? "" : v;
            }
          }
        });

        return { content, edit, blur, lines, code };
      },
      template: `
        <div contenteditable="false">
          <ace-component
              v-if="node.attrs.isEditing"
              :node="node"
              :update-attrs="updateAttrs"
              :view="view"
              :editor="editor"
              :get-pos="getPos"
              :code.sync="code"
              @blur="blur"
          />
          <div class="code-toolbar">
            <pre class="line-numbers" v-show="!node.attrs.isEditing">
              <span aria-hidden="true" class="line-numbers-rows">
                <span v-for="n in lines"></span>
              </span>
              <highlight-component :code="code" :language="node.attrs.language" />
              <code ref="content" v-show="false"></code>
            </pre>
            <div class="toolbar">
              <div class="toolbar-item">
                <span>{{node.attrs.language}}</span>
              </div>
              <div class="toolbar-item toolbar-action">
                <span @click="edit">Edit</span>
              </div>
            </div>
          </div>
        </div>
      `.replace(/>\s+</g, "><")
    });
  }

  commands({
    type,
    schema,
    attrs
  }: {
    type: NodeType;
    schema: Schema;
    attrs: { [p: string]: string };
  }): CommandGetter {
    return () => toggleBlockType(type, schema.nodes.paragraph);
  }

  keys({
    type,
    schema
  }: {
    type: NodeType;
    schema: Schema;
  }): { [p: string]: CommandFunction } {
    return {
      "Shift-Ctrl-\\": setBlockType(type),
      ...nodeKeys(
        node => node.type.name === "code_block",
        (ace, node) => (node.attrs.isEditing = true)
      )
    };
  }

  inputRules({ type, schema }: { type: NodeType; schema: Schema }): any[] {
    return [textblockTypeInputRule(/^```$/, type)];
  }

  pasteRules({ type, schema }: { type: NodeType; schema: Schema }): Plugin[] {
    let language = "";
    let code = "";
    return [
      nodeListPasteRule(
        content => {
          const match = /^```([a-zA-Z0-9]*)/.exec(content);
          if (match) {
            language = match[1];
            return Matched.CONTAIN_SKIP;
          }
          return Matched.NOT;
        },
        content => (/```$/.test(content) ? Matched.NOT_SKIP : Matched.CONTAIN),
        content => {
          code += content + "\n";
          return false;
        },
        () => {
          if (language === "") {
            language = "markup";
          }
          code = "";
        },
        (content, node, nodes) => {
          nodes.push(type.create({ language }, schema.text(code || "")));
          language = "";
          code = "";
        }
      )
    ];
  }
}
