<template>
  <v-app>
    <v-main>
      <v-container class="py-8 px-6" fluid>
        <v-row justify="space-around">
          <v-col cols="auto">
            <ModalVideoUpload />
          </v-col>
        </v-row>

        <v-container class="d-flex flex-wrap video-gallery align-content-center">
          <v-card elevation="2" min-width="400px" :loading="item.loading" outlined shaped v-for="item in videos"
            :key="item.id">
            <v-card-title>{{ item.name }}</v-card-title>
            <v-card-text>
              <div>Video ID: {{ item.id }}</div>
              <div>
                Length:
                {{ get_display_time(item.duration) }}
              </div>
              <div>License: {{ item.license }}</div>

              <v-card-actions>
                <v-btn outlined @click="showVideo(item.id)">
                  <v-icon>{{ "mdi-movie-search-outline" }}</v-icon> Analyse
                </v-btn>
                <v-btn color="red" outlined @click="deleteVideo(item.id)">
                  <v-icon>{{ "mdi-trash-can-outline" }}</v-icon> Delete
                </v-btn>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </v-container>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import router from "../router";
import ModalVideoUpload from "@/components/ModalVideoUpload.vue";
import TimeMixin from "../mixins/time";
import { mapStores } from "pinia";
import { useVideoStore } from "@/store/video.js";
import { useUserStore } from "@/store/user.js";
import { usePluginRunStore } from "@/store/plugin_run.js";

export default {
  mixins: [TimeMixin],
  data() {
    return {
      fetchTimer: null,
    };
  },
  methods: {
    deleteVideo(video_id) {
      console.log(video_id)
      this.videoStore.delete(video_id);
    },
    showVideo(video_id) {
      router.push({ path: `/videoanalysis/${video_id}` });
    },
    async fetchData() {
      // Ask backend about all videos
      await this.videoStore.fetchAll();

      await this.pluginRunStore.fetchAll({
        addResults: false,
      });
    },
  },
  computed: {
    videos() {
      let videos = this.videoStore.all;
      console.log(videos);
      videos.forEach((v) => {
        v.pluginRuns = this.pluginRunStore.fetchForVideo(v.id);
      });
      // videos.forEach((v) => {
      //   v.loading = !v.pluginRuns.reduce((a, b) => a && b.status === "D", true);
      // });
      return videos;
    },
    ...mapStores(useVideoStore, usePluginRunStore),
  },
  components: {
    ModalVideoUpload,
  },
  mounted() {
    this.fetchData();

    this.fetchTimer = setInterval(
      function () {
        this.fetchData();
      }.bind(this),
      5000
    );
  },

  // TODO rwrite everything
  beforeRouteEnter(to, from, next) {
    next(() => {
      const userStore = useUserStore();

      const loggedIn = userStore.loggedIn;
      if (!loggedIn && to.name !== "Login") {
        return router.push({ path: `/login`, query: { redirect: to.path } });
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    clearInterval(this.fetchTimer);
    next(true);
  },
};
</script>

<style>
.video-gallery>* {
  margin: 8px;
}
</style>
