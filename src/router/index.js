import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Videoanalysis from '@/views/Videoanalysis.vue';

import { useUserStore } from "@/store/user"

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

export default router;
