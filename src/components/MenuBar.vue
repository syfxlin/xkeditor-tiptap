<template>
  <div>
    <button
      v-for="menu in menus"
      :key="menu.id"
      :class="
        `${itemClass} ` +
          (commands[menu.name].isActive(menu.options).value ? 'is-active' : '')
      "
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
  name: "menu-bar",
  components: {
    Icon
  },
  props: {
    commands: Object,
    menus: Array,
    itemClass: String
  }
});
</script>

<style lang="scss" src="../assets/scss/menu-bar.scss"></style>
