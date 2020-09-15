<template>
  <div class="md-editor">
    <code-mirror :content="content" :options="options" />
    <div v-html="htmlContent" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue-demi";
import CodeMirror from "@/components/CodeMirror.vue";

export default defineComponent({
  name: "md-editor",
  components: {
    CodeMirror
  },
  setup() {
    const content = ref("# Markdown");
    const options = ref({
      lineNumbers: true
    });
    return { content, options };
  }
});
</script>
