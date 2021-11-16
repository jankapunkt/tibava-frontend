import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
//import jQuery from 'jquery';
//import bootstrap from 'bootstrap';
//import 'bootstrap'
import "bootstrap";
//import 'jquery'; 
import "bootstrap/dist/css/bootstrap.min.css";
import VueNotifikation from 'vue-notifikation';

//import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue"

import TrendChart from "vue-trend-chart";

Vue.use(TrendChart);
Vue.use(VueNotifikation);
//Vue.use(BootstrapVue)
//Vue.use(BootstrapVueIcons)

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
