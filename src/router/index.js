import Vue from "vue";
import VueRouter from "vue-router";
import Analysis from "../views/Analysis.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/analysis",
    name: "Analysis",
    component: Analysis,
  },
  {
    path: "/",//"/upload"
    name: "Upload",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Upload.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
