import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import "splitpanes/dist/splitpanes.css";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "@/App.vue";

Vue.config.productionTip = false;
Vue.use(VueCompositionAPI);
Vue.use(ElementUI);
library.add(fas);

new Vue({
  render: h => h(App)
}).$mount("#app");
