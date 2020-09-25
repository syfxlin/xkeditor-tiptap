import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import App from "./App.vue";
import "splitpanes/dist/splitpanes.css";

Vue.config.productionTip = false;
Vue.use(VueCompositionAPI);
library.add(fas);

new Vue({
  render: h => h(App)
}).$mount("#app");
