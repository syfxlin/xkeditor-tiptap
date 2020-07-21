<template>
  <div>
    <code-mirror-vue
      :content.sync="content"
      :options.sync="options"
      :cm.sync="cm"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "@vue/composition-api";
import { Node as ProsemirrorNode } from "prosemirror-model";
import CodeMirrorVue from "@/components/CodeMirror.vue";
import "codemirror/mode/javascript/javascript";
import { Editor } from "codemirror";

export default defineComponent({
  name: "code-mirror-component",
  components: {
    CodeMirrorVue
  },
  props: {
    node: ProsemirrorNode,
    view: Object,
    getPos: {},
    updateAttrs: {}
  },
  setup(props) {
    const content = computed({
      get: () => props.node?.attrs.content,
      set: v => {
        if (props.node !== undefined) {
          // @ts-ignore
          props.updateAttrs({
            content: v === undefined ? "" : v
          });
        }
      }
    });
    const options = ref({ lineNumbers: true });
    const cm = ref<Editor>();
    return { options, cm, content };
  }
});
</script>
