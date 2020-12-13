<template>
  <el-popover :reference="popover.ref" v-model="popover.active">
    <template v-if="popover.command === 'link'">
      <el-input
        type="url"
        placeholder="链接"
        size="small"
        v-model="popover.data.link"
      />
    </template>
    <div
      style="text-align: right; margin: 10px 0 0 0"
      v-if="popover.submit !== null || popover.cancel !== null"
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
import { useState } from "@/store";
import { PopoverProps } from "@/store/state";

export default defineComponent({
  name: "popover",
  setup() {
    const popover = useState<PopoverProps>("popover");

    return { popover };
  }
});
</script>
