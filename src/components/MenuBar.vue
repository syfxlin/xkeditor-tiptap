<template>
  <div>
    <template v-for="menu in menus">
      <el-button
        v-if="menu.type === 'button'"
        :key="menu.id"
        :id="'menu-item__' + menu.name"
        :class="menu.command.isActive(menu.options).value ? 'is-active' : ''"
        @click="menu.command.handler(menu.options)"
      >
        <icon :name="menu.icon" />
      </el-button>
      <el-select
        v-if="menu.type === 'select'"
        :key="menu.id"
        :id="'menu-item__' + menu.name"
        :filterable="menu.allowCreate"
        :allow-create="menu.allowCreate"
        :placeholder="menu.placeholder"
        v-model="menu.value.value"
        @change="menu.command.handler ? menu.command.handler : () => {}"
      >
        <el-option
          v-for="option in menu.options"
          :key="option.id"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-dropdown
        v-if="menu.type === 'dropdown'"
        :key="menu.id"
        :id="'menu-item__' + menu.name"
        @command="menu.command.handler"
        :split-button="menu.click !== undefined"
        @click="menu.click ? menu.click : () => {}"
      >
        <el-button v-if="menu.click === undefined">
          <icon v-if="menu.icon" :name="menu.icon" />
          <template v-if="menu.label">
            {{ menu.label }}
          </template>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <template v-else>
          <icon v-if="menu.icon" :name="menu.icon" />
          <template v-if="menu.label">
            {{ menu.label }}
          </template>
        </template>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="option in menu.options"
            :key="option.id"
            :command="option.command"
          >
            <icon v-if="option.icon" :name="option.icon" />
            {{ option.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button-group
        v-if="menu.type === 'color'"
        :key="menu.id"
        :id="'menu-item__' + menu.name"
        class="el-color"
        :class="menu.command.isActive(menu.options).value ? 'is-active' : ''"
      >
        <el-button
          :style="{ color: menu.value.value }"
          @click="menu.command.handler(menu.value.value)"
        >
          <icon :name="menu.icon" />
        </el-button>
        <el-color-picker
          show-alpha
          :predefine="menu.predefine"
          v-model="menu.value.value"
          @change="menu.command.handler ? menu.command.handler : () => {}"
        />
      </el-button-group>
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
    menus: Array
  }
});
</script>

<style lang="scss" src="../assets/scss/menu-bar.scss"></style>
