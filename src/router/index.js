import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Videoanalysis from '@/views/Videoanalysis.vue';
// import Imprint from '@/views/Imprint.vue';
// import Privacy from '@/views/Privacy.vue';
// import NotFound from '@/views/NotFound.vue';

Vue.use(VueRouter);
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/videoanalysis', name: 'Videoanalysis', component: Videoanalysis },
    // { path: '/imprint', name: 'Imprint', component: Imprint },
    // { path: '/privacy', name: 'Privacy', component: Privacy },
    // { path: '*', name: 'NotFound', component: NotFound },
  ],
});
export default router;
