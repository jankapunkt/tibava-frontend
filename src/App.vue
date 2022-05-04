<template>
  <v-app id="tibava">
    <v-app-bar app>
      <img :title="appName" src="./assets/logo_tib.svg" height="40" />
      <v-toolbar-title style="padding-right: 50px"
        >AV-Analytics</v-toolbar-title
      >

      <v-btn tile text class="ml-n2" href="/">
        <v-icon left color="primary">mdi-movie</v-icon>
        Your Videos
      </v-btn>

      <v-spacer></v-spacer>

      <UserMenu />
      <VideoMenu />
    </v-app-bar>
    <router-view />
  </v-app>
</template>

<script>
import UserMenu from "@/components/UserMenu.vue";
import VideoMenu from "@/components/VideoMenu.vue";

export default {
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
    };
  },
  components: {
    UserMenu,
    VideoMenu,
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
