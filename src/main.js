import Vue from 'vue'
import App from './App.vue'
import vuetify from '@/plugins/vuetify';
// import store from '@/store';
import i18n from '@/plugins/i18n';

import './styles/custom.css';

import { createPinia, PiniaVuePlugin } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useUserStore } from "@/store/user"


Vue.use(PiniaVuePlugin)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)



import router from '@/router';

var app = Vue.extend({

  async created() {
    const userStore = useUserStore()
    await userStore.getCSRFToken()
    await userStore.getUserData()


    // if(!this.$store.getters["user/loggedIn"]){
    //   router.push({ path: `/login` });
    // }

    // this.$store.dispatch('user/getCSRFToken').then(() => {
    //   this.$store.dispatch('user/getUserData');
    //   setTimeout(
    //     () => this.$store.dispatch('api/setState', this.$route.query),
    //     500
    //   );
    // });
  },
  watch: {
    // '$store.state.user.loggedIn': function () {
    //   this.$store.dispatch('collection/list');
    //   this.$store.dispatch('bookmark/list');
    // }
  }
})

new app({
  pinia,
  vuetify,
  router,
  i18n,
  render: h => h(App),
}).$mount('#app')

import Router from "vue-router";
Vue.use(Router)
// console.log("init done")

// router.beforeEach(async (to, from, next) => {
//   console.log("router")
//   const userStore = useUserStore()

//   const loggedIn = userStore.loggedIn;
//   console.log(loggedIn);
//   if (!loggedIn && to.name !== "Login") {
//     return router.push({ path: `/login`, query: { redirect: to.path } });
//   }
//   return next()
// })