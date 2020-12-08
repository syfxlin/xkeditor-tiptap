<template>
  <div>
    <template v-for="menu in menus">
      <button
        :key="menu.id"
        :class="
          itemClass +
            ' ' +
            (commands[menu.name].isActive(menu.options).value
              ? 'is-active'
              : '')
        "
        @click="commands[menu.name].handler(menu.options)"
        :data-tooltip="menu.tooltip"
      >
        <icon :name="menu.icon" />
      </button>
    </template>
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
