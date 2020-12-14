<template>
  <span>
    <transition
      :name="transition"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave"
    >
      <div
        class="el-popover el-popper"
        :class="[popperClass, content && 'el-popover--plain']"
        ref="popper"
        v-show="!disabled && showPopper"
        :style="{ width: width + 'px' }"
        role="tooltip"
        :id="tooltipId"
        :aria-hidden="disabled || !showPopper ? 'true' : 'false'"
      >
        <div class="el-popover__title" v-if="title" v-text="title"></div>
        <slot>{{ content }}</slot>
      </div>
    </transition>
    <span class="el-popover__reference-wrapper" ref="wrapper">
      <slot name="reference"></slot>
    </span>
  </span>
</template>
<script>
import { addClass, off, on, removeClass } from "element-ui/src/utils/dom";
import { PopupManager } from "element-ui/src/utils/popup";
import { generateId } from "element-ui/src/utils/util";
import Vue from "vue";

const PopperJS = Vue.prototype.$isServer
  ? // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {}
  : require("element-ui/src/utils/popper");
const stop = e => e.stopPropagation();

export default {
  name: "ElPopover",

  props: {
    trigger: {
      type: String,
      default: "click",
      validator: value =>
        ["click", "focus", "hover", "manual"].indexOf(value) > -1
    },
    openDelay: {
      type: Number,
      default: 0
    },
    closeDelay: {
      type: Number,
      default: 200
    },
    title: String,
    disabled: Boolean,
    content: String,
    reference: {},
    popperClass: String,
    width: {},
    visibleArrow: {
      default: true
    },
    arrowOffset: {
      type: Number,
      default: 0
    },
    transition: {
      type: String,
      default: "fade-in-linear"
    },
    tabindex: {
      type: Number,
      default: 0
    },
    transformOrigin: {
      type: [Boolean, String],
      default: true
    },
    placement: {
      type: String,
      default: "bottom"
    },
    boundariesPadding: {
      type: Number,
      default: 5
    },
    popper: {},
    offset: {
      default: 0
    },
    value: Boolean,
    appendToBody: {
      type: Boolean,
      default: true
    },
    popperOptions: {
      type: Object,
      default() {
        return {
          gpuAcceleration: false
        };
      }
    }
  },
  data() {
    return {
      showPopper: false,
      currentPlacement: ""
    };
  },
  computed: {
    tooltipId() {
      return `el-popover-${generateId()}`;
    }
  },
  watch: {
    showPopper(val) {
      if (this.disabled) {
        return;
      }
      val ? this.$emit("show") : this.$emit("hide");
      val ? this.updatePopper() : this.destroyPopper();
      this.$emit("input", val);
    },
    value: {
      immediate: true,
      handler(val) {
        this.showPopper = val;
        this.$emit("input", val);
      }
    },
    reference(val) {
      this.popperJS._reference = val;
    }
  },

  mounted() {
    let reference = (this.referenceElm =
      this.reference || this.$refs.reference);
    const popper = this.popper || this.$refs.popper;

    if (!reference && this.$refs.wrapper.children) {
      reference = this.referenceElm = this.$refs.wrapper.children[0];
    }
    // 可访问性
    if (reference) {
      addClass(reference, "el-popover__reference");
      reference.setAttribute("aria-describedby", this.tooltipId);
      reference.setAttribute("tabindex", this.tabindex); // tab序列
      popper.setAttribute("tabindex", 0);

      if (this.trigger !== "click") {
        on(reference, "focusin", () => {
          this.handleFocus();
          const instance = reference.__vue__;
          if (instance && typeof instance.focus === "function") {
            instance.focus();
          }
        });
        on(popper, "focusin", this.handleFocus);
        on(reference, "focusout", this.handleBlur);
        on(popper, "focusout", this.handleBlur);
      }
      on(reference, "keydown", this.handleKeydown);
      on(reference, "click", this.handleClick);
    }
    if (this.trigger === "click") {
      on(reference, "click", this.doToggle);
      on(document, "click", this.handleDocumentClick);
    } else if (this.trigger === "hover") {
      on(reference, "mouseenter", this.handleMouseEnter);
      on(popper, "mouseenter", this.handleMouseEnter);
      on(reference, "mouseleave", this.handleMouseLeave);
      on(popper, "mouseleave", this.handleMouseLeave);
    } else if (this.trigger === "focus") {
      if (this.tabindex < 0) {
        console.warn(
          "[Element Warn][Popover]a negative taindex means that the element cannot be focused by tab key"
        );
      }
      if (reference.querySelector("input, textarea")) {
        on(reference, "focusin", this.doShow);
        on(reference, "focusout", this.doClose);
      } else {
        on(reference, "mousedown", this.doShow);
        on(reference, "mouseup", this.doClose);
      }
    }
  },

  beforeDestroy() {
    this.cleanup();
    this.doDestroy(true);
    if (this.popperElm && this.popperElm.parentNode === document.body) {
      this.popperElm.removeEventListener("click", stop);
      document.body.removeChild(this.popperElm);
    }
  },

  deactivated() {
    this.cleanup();
    this.$options.beforeDestroy[0].call(this);
  },

  methods: {
    doToggle() {
      this.showPopper = !this.showPopper;
    },
    doShow() {
      this.showPopper = true;
    },
    doClose() {
      this.showPopper = false;
    },
    handleFocus() {
      addClass(this.referenceElm, "focusing");
      if (this.trigger === "click" || this.trigger === "focus")
        this.showPopper = true;
    },
    handleClick() {
      removeClass(this.referenceElm, "focusing");
    },
    handleBlur() {
      removeClass(this.referenceElm, "focusing");
      if (this.trigger === "click" || this.trigger === "focus")
        this.showPopper = false;
    },
    handleMouseEnter() {
      clearTimeout(this._timer);
      if (this.openDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = true;
        }, this.openDelay);
      } else {
        this.showPopper = true;
      }
    },
    handleKeydown(ev) {
      if (ev.keyCode === 27 && this.trigger !== "manual") {
        // esc
        this.doClose();
      }
    },
    handleMouseLeave() {
      clearTimeout(this._timer);
      if (this.closeDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = false;
        }, this.closeDelay);
      } else {
        this.showPopper = false;
      }
    },
    handleDocumentClick(e) {
      let reference = this.reference || this.$refs.reference;
      const popper = this.popper || this.$refs.popper;

      if (!reference && this.$refs.wrapper.children) {
        reference = this.referenceElm = this.$refs.wrapper.children[0];
      }
      if (
        !this.$el ||
        !reference ||
        this.$el.contains(e.target) ||
        reference.contains(e.target) ||
        !popper ||
        popper.contains(e.target)
      )
        return;
      this.showPopper = false;
    },
    handleAfterEnter() {
      this.$emit("after-enter");
    },
    handleAfterLeave() {
      this.$emit("after-leave");
      this.doDestroy();
    },
    cleanup() {
      if (this.openDelay || this.closeDelay) {
        clearTimeout(this._timer);
      }
    },
    createPopper() {
      if (this.$isServer) return;
      this.currentPlacement = this.currentPlacement || this.placement;
      if (
        !/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)
      ) {
        return;
      }

      const options = this.popperOptions;
      const popper = (this.popperElm =
        this.popperElm || this.popper || this.$refs.popper);
      let reference = (this.referenceElm =
        this.referenceElm || this.reference || this.$refs.reference);

      if (!reference && this.$slots.reference && this.$slots.reference[0]) {
        reference = this.referenceElm = this.$slots.reference[0].elm;
      }

      if (!popper || !reference) return;
      if (this.visibleArrow) this.appendArrow(popper);
      if (this.appendToBody) document.body.appendChild(this.popperElm);
      if (this.popperJS && this.popperJS.destroy) {
        this.popperJS.destroy();
      }

      options.placement = this.currentPlacement;
      options.offset = this.offset;
      options.arrowOffset = this.arrowOffset;
      this.popperJS = new PopperJS(reference, popper, options);
      this.popperJS.onCreate(_ => {
        this.$emit("created", this);
        this.resetTransformOrigin();
        this.$nextTick(this.updatePopper);
      });
      if (typeof options.onUpdate === "function") {
        this.popperJS.onUpdate(options.onUpdate);
      }
      this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
      this.popperElm.addEventListener("click", stop);
    },

    updatePopper() {
      const popperJS = this.popperJS;
      if (popperJS) {
        popperJS.update();
        if (popperJS._popper) {
          popperJS._popper.style.zIndex = PopupManager.nextZIndex();
        }
      } else {
        this.createPopper();
      }
    },

    doDestroy(forceDestroy) {
      /* istanbul ignore if */
      if (!this.popperJS || (this.showPopper && !forceDestroy)) return;
      this.popperJS.destroy();
      this.popperJS = null;
    },

    destroyPopper() {
      if (this.popperJS) {
        this.resetTransformOrigin();
      }
    },

    resetTransformOrigin() {
      if (!this.transformOrigin) return;
      const placementMap = {
        top: "bottom",
        bottom: "top",
        left: "right",
        right: "left"
      };
      const placement = this.popperJS._popper
        .getAttribute("x-placement")
        .split("-")[0];
      const origin = placementMap[placement];
      this.popperJS._popper.style.transformOrigin =
        typeof this.transformOrigin === "string"
          ? this.transformOrigin
          : ["top", "bottom"].indexOf(placement) > -1
          ? `center ${origin}`
          : `${origin} center`;
    },

    appendArrow(element) {
      let hash;
      if (this.appended) {
        return;
      }

      this.appended = true;

      for (const item in element.attributes) {
        if (/^_v-/.test(element.attributes[item].name)) {
          hash = element.attributes[item].name;
          break;
        }
      }

      const arrow = document.createElement("div");

      if (hash) {
        arrow.setAttribute(hash, "");
      }
      arrow.setAttribute("x-arrow", "");
      arrow.className = "popper__arrow";
      element.appendChild(arrow);
    }
  },
  destroyed() {
    const reference = this.reference;

    off(reference, "click", this.doToggle);
    off(reference, "mouseup", this.doClose);
    off(reference, "mousedown", this.doShow);
    off(reference, "focusin", this.doShow);
    off(reference, "focusout", this.doClose);
    off(reference, "mousedown", this.doShow);
    off(reference, "mouseup", this.doClose);
    off(reference, "mouseleave", this.handleMouseLeave);
    off(reference, "mouseenter", this.handleMouseEnter);
    off(document, "click", this.handleDocumentClick);
  }
};
</script>
