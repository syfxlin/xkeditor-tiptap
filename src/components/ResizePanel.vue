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

<style lang="scss">
.splitpanes.splitpanes-default {
  .splitpanes__pane {
    background-color: #fff;
  }
  .splitpanes__splitter {
    background-color: #f7f7f7;
    box-sizing: border-box;
    position: relative;
    flex-shrink: 0;
    &:before,
    &:after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      background-color: rgba(0, 0, 0, 0.15);
      transition: background-color 0.3s;
    }
    &:hover:before,
    &:hover:after {
      background-color: rgba(0, 0, 0, 0.25);
    }
    &:first-child {
      cursor: auto;
    }
  }
}

.splitpanes-default {
  &.splitpanes .splitpanes .splitpanes__splitter {
    z-index: 1;
  }
  &.splitpanes--vertical > .splitpanes__splitter,
  .splitpanes--vertical > .splitpanes__splitter {
    width: 7px;
    border-left: 1px solid #f7f7f7;
    border-right: 1px solid #f7f7f7;
    margin-left: -1px;
    &:before,
    &:after {
      transform: translateY(-50%);
      width: 1px;
      height: 30px;
    }
    &:before {
      margin-left: -2px;
    }
    &:after {
      margin-left: 1px;
    }
  }
}
</style>
