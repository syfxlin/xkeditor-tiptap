<template>
  <div class="menubar">
    <button
      v-for="menu in menus"
      :key="menu.id"
      class="menubar__button"
      :class="{ 'is-active': commands[menu.name].isActive(menu.options).value }"
      @click="commands[menu.name].handler(menu.options)"
    >
      <icon :name="menu.icon" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "md-menu-bar",
  components: {
    Icon
  },
  props: {
    commands: Object,
    menus: Array
  }
});
</script>
