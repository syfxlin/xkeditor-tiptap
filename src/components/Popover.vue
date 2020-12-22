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
    <template v-if="popover.command === 'image'">
      <div class="el-popover__item">
        <el-input
          type="url"
          placeholder="链接"
          size="small"
          v-model="popover.data.src"
        />
      </div>
      <div class="el-popover__item">
        <el-input
          type="text"
          placeholder="描述"
          size="small"
          v-model="popover.data.alt"
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
      <div class="el-popover__item" v-if="xk.uploadImage">
        <el-upload
          drag
          :action="xk.uploadImage"
          :on-success="uploadSuccess"
          :http-request="upload"
        >
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </div>
    </template>
    <template v-if="popover.command === 'katex'">
      <div class="el-popover__item">
        <el-input
          type="textarea"
          placeholder="公式"
          size="small"
          v-model="popover.data.tex"
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
        :loading="item.loading"
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
import { PopoverProps, XkConfig } from "@/store/state";
import ElPopover from "@/components/ElPopover.vue";
import { upload, UploadResponse } from "@/utils/req";

export default defineComponent({
  name: "popover",
  components: {
    ElPopover
  },
  setup() {
    const popover = useState<PopoverProps>("popover");
    const hide = useAction<Actions>().popover.hide;
    const xk = useState<XkConfig>("config.xk");

    const uploadSuccess = (res: UploadResponse) => {
      if (!popover.value.data) {
        popover.value.data = {};
      }
      popover.value.data.src = res.data.url;
      popover.value.data.alt = res.data.filename;
      popover.value.data.title = res.data.key;
    };

    return { popover, hide, xk, uploadSuccess, upload };
  }
});
</script>

<style lang="scss">
.el-popover {
  &__item {
    margin-bottom: 7px;
  }
}
.el-upload-dragger {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
