<template>
  <splitpanes @resize="resize($event)">
    <pane :max-size="fillMax" :min-size="fillMin" :size="leftSize"></pane>
    <slot></slot>
    <pane :max-size="fillMax" :min-size="fillMin" :size="rightSize"></pane>
  </splitpanes>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue-demi";
import { Pane, Splitpanes } from "splitpanes";

export default defineComponent({
  name: "resize-panel",
  components: {
    Splitpanes,
    Pane
  },
  props: {
    size: Object,
    async: Boolean,
    init: Number
  },
  setup(props) {
    const fillMax = computed(
      () => (100 - (props.size === undefined ? 20 : props.size.min)) / 2
    );
    const fillMin = computed(
      () => (100 - (props.size === undefined ? 80 : props.size.min)) / 2
    );
    let initSize = props.init === undefined ? 25 : (100 - props.init) / 2;
    if (initSize > fillMax.value) {
      initSize = fillMax.value;
    }
    if (initSize < fillMin.value) {
      initSize = fillMin.value;
    }
    const leftSize = ref(initSize);
    const rightSize = ref(initSize);

    const resize = (event: { size: number }[]) => {
      if (leftSize.value === event[0].size) {
        rightSize.value = event[event.length - 1].size;
        if (!props.async) {
          leftSize.value = event[event.length - 1].size;
        }
      } else {
        leftSize.value = event[0].size;
        if (!props.async) {
          rightSize.value = event[0].size;
        }
      }
    };

    return { fillMax, fillMin, leftSize, rightSize, resize };
  }
});
</script>
