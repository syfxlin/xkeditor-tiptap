<template>
  <el-popover :reference="popover.ref" v-model="popover.active" @hide="hide">
    <template v-if="popover.command === 'link'">
      <el-input
        type="url"
        placeholder="链接"
        size="small"
        v-model="popover.data.href"
      />
    </template>
    <div
      style="text-align: right; margin: 10px 0 0 0"
      v-if="popover.submit || popover.cancel"
    >
      <el-button
        size="mini"
        type="text"
        v-if="popover.cancel"
        @click="popover.cancel.handler(popover)"
      >
        {{ popover.cancel.label }}
      </el-button>
      <el-button
        type="primary"
        size="mini"
        v-if="popover.submit"
        @click="popover.submit.handler(popover)"
      >
        {{ popover.submit.label }}
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
