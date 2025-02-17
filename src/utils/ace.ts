import { Ace, Range } from "ace-builds";
import { Command, Node, NodeSpec, Selection } from "@/utils/prosemirror";
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  Ref
} from "vue-demi";
import { CommandFunction } from "tiptap-commands";
import { MdSpec } from "@/marked/MdSpec";
import { Node as ProsemirrorNode } from "prosemirror-model";
import { Editor as TipTapEditor } from "tiptap";
import AceComponent from "@/block/other/AceComponent.vue";
import Editor = Ace.Editor;

export function focus(ace: Editor | undefined | null) {
  if (ace === undefined || ace === null) {
    return;
  }
  ace.focus();
}

export function cursorToStart(ace: Editor | undefined | null) {
  if (ace === undefined || ace === null) {
    return;
  }
  ace.focus();
  ace.moveCursorTo(0, 0);
}

export function cursorToEnd(ace: Editor | undefined | null) {
  if (ace === undefined || ace === null) {
    return;
  }
  ace.focus();
  const row = ace.session.getLength() - 1;
  const col = ace.session.getLine(row).length;
  ace.moveCursorTo(row, col);
}

export function isAce(pos: Selection) {
  return pos.$head && pos.$head.parent.type.spec.ace;
}

export function aceRef(pos: Selection) {
  return pos.$head.parent.attrs.aceRef;
}

export function dirFocus(target: Editor, dir: 1 | -1) {
  if (dir === 1) {
    cursorToStart(target);
  } else {
    cursorToEnd(target);
  }
}

function arrowHandler(
  dir: "left" | "right" | "down" | "up" | "backspace" | "delete",
  ifIn?: (node: Node, dir: 1 | -1) => boolean,
  beforeIn?: (cm: Editor, node: Node, dir: 1 | -1) => void,
  afterIn?: (cm: Editor, node: Node, dir: 1 | -1) => void
): Command {
  return (state, dispatch, view) => {
    let eot = dir;
    if (eot === "backspace") {
      eot = "left";
    } else if (eot === "delete") {
      eot = "right";
    }
    if (state.selection.empty && view && view.endOfTextblock(eot)) {
      const side = eot === "left" || eot === "up" ? -1 : 1;
      const $head = state.selection.$head;
      const nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side
      );
      if (isAce(nextPos) && (!ifIn || ifIn(nextPos.$head.parent, side))) {
        const cm = aceRef(nextPos);
        if (beforeIn) {
          beforeIn(cm, nextPos.$head.parent, side);
        }
        // 在下一个序列中执行防止 focus 失效
        nextTick(() => {
          dirFocus(cm, side);
          if (afterIn) {
            afterIn(cm, nextPos.$head.parent, side);
          }
        });
        return true;
      }
    }
    return false;
  };
}

export function nodeKeys(
  ifIn?: (node: Node, dir: 1 | -1) => boolean,
  beforeIn?: (cm: Editor, node: Node, dir: 1 | -1) => void,
  afterIn?: (cm: Editor, node: Node, dir: 1 | -1) => void
): { [p: string]: CommandFunction } {
  return {
    ArrowLeft: arrowHandler("left", ifIn, beforeIn, afterIn),
    ArrowRight: arrowHandler("right", ifIn, beforeIn, afterIn),
    ArrowUp: arrowHandler("up", ifIn, beforeIn, afterIn),
    ArrowDown: arrowHandler("down", ifIn, beforeIn, afterIn),
    Backspace: arrowHandler("backspace", ifIn, beforeIn, afterIn),
    Delete: arrowHandler("delete", ifIn, beforeIn, afterIn)
  };
}

export function mergeNodeSpec(spec: NodeSpec & MdSpec): NodeSpec {
  spec.attrs = {
    ...spec.attrs,
    aceRef: {
      default: undefined
    }
  };
  return {
    content: "text*",
    group: "block",
    code: true,
    defining: true,
    isolating: true,
    ace: true,
    ...spec
  };
}

export function scEditor(
  name: string,
  codeToView: (code: string, element: Ref<HTMLElement | undefined>) => void,
  viewAttrs?: {
    class: string;
  },
  setup?: (props: any) => { [key: string]: any }
) {
  return defineComponent({
    name,
    components: {
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
      const isEditing = ref(true);
      const code = computed({
        get: () => props.node?.textContent,
        set: v => {
          if (props.node && props.getPos && props.view && v !== undefined) {
            const change = computeChange(props.node?.textContent, v);
            if (change) {
              const start = props.getPos() + 1;
              const tr = props.view.state.tr.replaceWith(
                start + change.from,
                start + change.to,
                change.text ? props.view.state.schema.text(change.text) : null
              );
              props.view.dispatch(tr);
            }
          }
        }
      });
      const element = ref<HTMLElement>();

      let result = {};
      if (setup) {
        result = setup(props);
      }

      onMounted(() => {
        nextTick(() => {
          dirFocus(props.node?.attrs.aceRef, 1);
        });
      });

      const edit = () => {
        isEditing.value = !isEditing.value;
        if (!isEditing.value) {
          codeToView(code.value || "", element);
        }
      };

      return {
        code,
        isEditing,
        ...result,
        attrs: viewAttrs || {},
        element,
        edit
      };
    },
    template: `
      <div class="sc-editor" contenteditable="false" :class="attrs.class">
        <el-button @click="edit">切换</el-button>
        <ace-component
          :node="node"
          :update-attrs="updateAttrs"
          :view="view"
          :editor="editor"
          :get-pos="getPos"
          :code.sync="code"
          v-if="isEditing"
        />
        <div v-else ref="element"></div>
      </div>
    `.replace(/>\s+</g, "><")
  });
}

export function insertText(
  ace: Ace.Editor,
  insert: { left?: string; right?: string; replace?: string },
  moveToLeft: null | number = null,
  fromStart = false
) {
  const selectText = ace.getSelectedText();
  const str = insert.replace
    ? insert.replace
    : (insert.left || "") + selectText + (insert.right || "");
  const range = ace.getSelectionRange();
  if (fromStart) {
    for (let i = range.start.row; i <= range.end.row; i++) {
      ace.session.replace(new Range(i, 0, i, 0), str);
    }
  } else {
    ace.session.replace(range, str);
  }
  if (moveToLeft !== null) {
    if (moveToLeft !== 0) {
      // @ts-ignore
      ace.navigateLeft(moveToLeft);
    }
  } else if (insert.right) {
    // @ts-ignore
    ace.navigateLeft(insert.right.length);
  }
  ace.focus();
}

export function computeChange(oldVal: string, newVal: string) {
  if (oldVal == newVal) {
    return null;
  }
  let start = 0,
    oldEnd = oldVal.length,
    newEnd = newVal.length;
  while (
    start < oldEnd &&
    oldVal.charCodeAt(start) == newVal.charCodeAt(start)
  ) {
    ++start;
  }
  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--;
    newEnd--;
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) };
}
