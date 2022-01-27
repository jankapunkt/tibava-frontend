<template>
  <v-app>
    <v-app-bar app flat>
      <v-layout row>
        <div class="logo ml-3 mr-5" @click="reset">
          <img :title="appName" src="../assets/logo.png" />
        </div>

        <SearchBar />

        <!-- <v-btn
          :title="$t('drawer.filter.title')"
          @click="toggleDrawer('filter')"
          class="ml-1"
          icon
        >
          <span id="filter-general">
            <v-badge v-if="nFilters" color="accent" :content="nFilters">
              <v-icon>mdi-tune</v-icon>
            </v-badge>
            <v-icon v-else>mdi-tune</v-icon>
          </span>
        </v-btn>

        <v-btn
          :title="$t('drawer.settings.title')"
          @click="toggleDrawer('settings')"
          class="ml-n2"
          icon
        >
          <span id="settings-general">
            <v-icon>mdi-cog-outline</v-icon>
          </span>
        </v-btn> -->

        <History />
        <UserMenu />
      </v-layout>
    </v-app-bar>
    
    <!-- <DrawerSettings /> -->
    <VideoPlayer />
    <!-- <DrawerFilter />
    <HelpButton /> -->
  </v-app>
</template>

<script>
import History from "@/components/History.vue";
import UserMenu from "@/components/UserMenu.vue";
import SearchBar from "@/components/SearchBar.vue";
import VideoPlayer from "@/components/VideoPlayer.vue";
// import HelpButton from '@/components/HelpButton.vue';
// import Footer from '@/components/Footer.vue';

export default {
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
    };
  },
  methods: {
    reset() {},
  },
  components: {
    History,
    UserMenu,
    SearchBar,
    VideoPlayer,
    // HelpButton,
    // Footer,
  },
};
</script>

<style scoped>
.logo > img {
  max-height: 56px;
}
</style>
