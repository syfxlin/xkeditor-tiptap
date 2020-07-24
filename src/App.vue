<template>
  <div id="app">
    <tip-tap />
    <div>
      {{ count }}
      <button @click="addCount">Add</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import TipTap from "@/components/TipTap.vue";
import { useAction, useState } from "@/store";

export default defineComponent({
  name: "App",
  components: {
    TipTap
  },
  setup() {
    const count = useState<number>("count");
    const addCount = useAction<Function>("addCount");

    return { count, addCount };
  }
});
</script>

<style lang="scss"></style>
