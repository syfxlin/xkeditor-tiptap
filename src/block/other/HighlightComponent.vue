<script lang="ts">
import refractor from "refractor";
import { computed, defineComponent, h } from "vue-demi";
import { RefractorNode } from "refractor/core";
import { VNodeChildren } from "vue";

export default defineComponent({
  name: "highlight-component",
  props: {
    code: String,
    language: String
  },
  setup(props) {
    const nodes = computed(() =>
      refractor.highlight(props.code || "", props.language || "markup")
    );
    const parseNodes = (nodes: RefractorNode[]): VNodeChildren => {
      return nodes.map(node => {
        if (node.type === "text") {
          return node.value;
        } else {
          return h(
            node.tagName,
            {
              class: node.properties.className
            },
            parseNodes(node.children)
          );
        }
      });
    };
    const render = computed(() => parseNodes(nodes.value));

    return () => h("code", render.value);
  }
});
</script>
