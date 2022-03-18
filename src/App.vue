<template>
  <v-app id="tibava">
    <v-app-bar app>
      <v-row>
        <div class="logo ml-3 mr-5">
          <img :title="appName" src="./assets/logo.png" height="40" />
        </div>

        <SearchBar />
        <UserMenu />
        <VideoMenu />
      </v-row>
    </v-app-bar>
    <router-view />
  </v-app>
</template>

<script>
import UserMenu from "@/components/UserMenu.vue";
import SearchBar from "@/components/SearchBar.vue";
import VideoMenu from "@/components/VideoMenu.vue";

export default {
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
    };
  },
  components: {
    UserMenu,
    SearchBar,
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
