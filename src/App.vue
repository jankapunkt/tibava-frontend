<template>
  <v-app id="tibava">
    <v-app-bar app>
      <img :title="appName" src="./assets/logo_tib.svg" height="40" />
      <v-toolbar-title style="padding-right: 50px">AV-Analytics</v-toolbar-title>

      <v-btn tile text class="ml-n2" to="/">
        <v-icon left color="primary">mdi-movie</v-icon>
        Videos
      </v-btn>

      <v-spacer></v-spacer>
      <PluginMenu style="margin-right: 10px;" v-if="videoLoaded" />
      <History style="margin-right: 10px;" v-if="videoLoaded" />
      <AnnotationMenu style="margin-right: 10px;" v-if="videoLoaded" />
      <VideoMenu style="margin-right: 10px;" v-if="videoLoaded" />
      <UserMenu />
    </v-app-bar>
    <router-view />
  </v-app>
</template>

<script>
import UserMenu from "@/components/UserMenu.vue";
import VideoMenu from "@/components/VideoMenu.vue";
import PluginMenu from "@/components/PluginMenu.vue";
import AnnotationMenu from "@/components/AnnotationMenu.vue";
import History from "./components/History.vue";

import { mapStores } from "pinia";
import { useUserStore } from "@/store/user";
import { usePlayerStore } from "@/store/player";

export default {
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
    };
  },
  computed: {
    loggedIn() {
      return this.userStore.loggedIn;
    },
    videoLoaded() {
      return this.playerStore.videoId !== null;
    },

    ...mapStores(useUserStore, usePlayerStore),
  },
  components: {
    UserMenu,
    VideoMenu,
    PluginMenu,
    AnnotationMenu,
    History
  },
};
</script>

<style>
#tibava {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  /* margin-top: 0px; */
}
</style>
