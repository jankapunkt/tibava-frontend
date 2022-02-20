import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Videoanalysis from '@/views/Videoanalysis.vue';
import store from '@/store';

Vue.use(VueRouter);
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/videoanalysis/:id', name: 'Videoanalysis', component: Videoanalysis },
    // { path: '*', name: 'NotFound', component: NotFound },
  ],
});

router.beforeEach(async (to,from, next)=>{
  const loggedIn = store.getters["user/loggedIn"];
  console.log(loggedIn);
  if(!loggedIn && to.name !== "Login" ){
      return router.push({ path: `/login`,  query: { redirect: to.path }});
  }
  return next()
})
export default router;
