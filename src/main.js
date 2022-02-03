import Vue from 'vue'
import App from './App.vue'
import vuetify from '@/plugins/vuetify';
import store from '@/store';
import i18n from '@/plugins/i18n';
import router from '@/router';

import './styles/custom.css';

var app = Vue.extend({

  created() {
    this.$store.dispatch('user/getCSRFToken')
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
  vuetify,
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
