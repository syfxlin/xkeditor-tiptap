<template>
  <div>
    <div class="editor">
      <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
        <div class="menubar">
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            <icon name="bold" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
          >
            <icon name="italic" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.strike() }"
            @click="commands.strike"
          >
            <icon name="strikethrough" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline"
          >
            <icon name="underline" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code() }"
            @click="commands.code"
          >
            <icon name="code" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.paragraph() }"
            @click="commands.paragraph"
          >
            <icon name="paragraph" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
            @click="commands.heading({ level: 1 })"
          >
            H1
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })"
          >
            H2
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })"
          >
            H3
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bullet_list() }"
            @click="commands.bullet_list"
          >
            <icon name="list-ul" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click="commands.ordered_list"
          >
            <icon name="list-ol" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.blockquote() }"
            @click="commands.blockquote"
          >
            <icon name="quote-left" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code_mirror() }"
            @click="commands.code_mirror"
          >
            <icon name="code" />
          </button>

          <button class="menubar__button" @click="commands.horizontal_rule">
            <icon name="minus" />
          </button>

          <button class="menubar__button" @click="commands.undo">
            <icon name="undo" />
          </button>

          <button class="menubar__button" @click="commands.redo">
            <icon name="redo" />
          </button>
        </div>
      </editor-menu-bar>
      <editor-menu-bubble
        :editor="editor"
        :keep-in-bounds="keepInBounds"
        v-slot="{ commands, isActive, menu }"
      >
        <div
          class="menububble"
          :class="{ 'is-active': menu.isActive }"
          :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
        >
          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            <icon name="bold" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
          >
            <icon name="italic" />
          </button>

          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.code() }"
            @click="commands.code"
          >
            <icon name="code" />
          </button>
        </div>
      </editor-menu-bubble>
      <editor-floating-menu
        :editor="editor"
        v-slot="{ commands, isActive, menu }"
      >
        <div
          class="editor__floating-menu"
          :class="{ 'is-active': menu.isActive }"
          :style="`top: ${menu.top}px`"
        >
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
            @click="commands.heading({ level: 1 })"
          >
            H1
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })"
          >
            H2
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })"
          >
            H3
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bullet_list() }"
            @click="commands.bullet_list"
          >
            <icon name="list-ul" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click="commands.ordered_list"
          >
            <icon name="list-ol" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.blockquote() }"
            @click="commands.blockquote"
          >
            <icon name="quote-left" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code_mirror() }"
            @click="commands.code_mirror"
          >
            <icon name="code" />
          </button>
        </div>
      </editor-floating-menu>

      <editor-content class="editor__content" :editor="editor" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  reactive,
  ref
} from "@vue/composition-api";
import Icon from "@/components/Icon.vue";
import {
  Editor,
  EditorContent,
  EditorFloatingMenu,
  EditorMenuBar,
  EditorMenuBubble
} from "tiptap";
import {
  Blockquote,
  Bold,
  BulletList,
  Code,
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

import IframeNode from "@/block/IFrameNode";
import CodeMirrorNode from "@/block/CodeMirrorNode";

export default defineComponent({
  name: "TipTap",
  components: {
    EditorMenuBar,
    EditorContent,
    EditorMenuBubble,
    EditorFloatingMenu,
    Icon
  },
  setup() {
    const editor = reactive(
      new Editor({
        extensions: [
          new IframeNode(),
          new CodeMirrorNode(),
          new Blockquote(),
          // new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new BulletList(),
          new OrderedList(),
          new ListItem(),
          new TodoItem(),
          new TodoList(),
          new Bold(),
          new Code(),
          new Italic(),
          new Link(),
          new Strike(),
          new Underline(),
          new History(),
          // new CodeBlockHighlight(),
          new Collaboration(),
          new Focus(),
          new Image(),
          // new Highlight(),
          new HorizontalRule(),
          new Mention(),
          new Placeholder(),
          new Search(),
          // new Suggestions(),
          new Table(),
          new TableCell(),
          new TableHeader(),
          new TableRow(),
          new TrailingNode()
        ],
        content: `
          <h1>Yay Headlines!</h1>
          <p>All these <strong>cool tags</strong> are working now.</p>
          <pre>
          function max(a, b) {
            return a > b ? a : b
          }</pre>
        `
      })
    );
    const keepInBounds = ref(true);
    onBeforeUnmount(() => {
      editor.destroy();
    });
    return { editor, keepInBounds };
  }
});
</script>

<style lang="scss" src="../assets/scss/main.scss"></style>
