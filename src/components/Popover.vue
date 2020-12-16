<template>
  <el-popover :reference="popover.ref" v-model="popover.active" @hide="hide">
    <template v-if="popover.command === 'link'">
      <div class="el-popover__item">
        <el-input
          type="url"
          placeholder="链接"
          size="small"
          v-model="popover.data.href"
        />
      </div>
      <div class="el-popover__item">
        <el-input
          type="text"
          placeholder="悬停显示"
          size="small"
          v-model="popover.data.title"
        />
      </div>
      <div class="el-popover__item">
        <el-switch
          active-text="新标签页打开"
          inactive-color="当前页打开"
          v-model="popover.data.target"
        />
      </div>
    </template>
    <div
      style="text-align: right; margin: 10px 0 0 0"
      v-if="popover.buttons && popover.buttons.length > 0"
    >
      <el-button
        v-for="item in popover.buttons"
        :key="item.id"
        size="mini"
        :type="item.type"
        @click="item.handler(popover)"
      >
        {{ item.label }}
      </el-button>
    </div>
  </el-popover>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import { Actions, useAction, useState } from "@/store";
import { PopoverProps } from "@/store/state";
import ElPopover from "@/components/ElPopover.vue";

export default defineComponent({
  name: "popover",
  components: {
    ElPopover
  },
  setup() {
    const popover = useState<PopoverProps>("popover");
    const hide = useAction<Actions>().popover.hide;

    return { popover, hide };
  }
});
</script>

<style lang="scss">
.el-popover {
  &__item {
    margin-bottom: 7px;
  }
}
</style>
