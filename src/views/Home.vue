<template>
  <v-app>
    <v-main>
      <v-container class="py-8 px-6" fluid>
        <v-row justify="space-around">
          <v-col cols="auto">
            <ModalVideoUpload />
          </v-col>
        </v-row>

        <v-container
          class="d-flex flex-wrap video-gallery align-content-center"
        >
          <v-card
            elevation="2"
            min-width="400px"
            v-bind:loading="item.loading"
            v-bind:disabled="item.loading"
            outlined
            shaped
            v-for="item in videos"
            :key="item.id"
          >
            <v-card-title>{{ item.name }}</v-card-title>
            <v-card-text>
              <div>Video ID: {{ item.id }}</div>
              <div>
                Length:
                {{ get_display_time(item.duration) }}
              </div>
              <div>License: {{ item.license }}</div>

              <v-card-actions>
                <v-btn outlined @click="show_video(item.id)">
                  <v-icon>{{ "mdi-movie-search-outline" }}</v-icon> Analyse
                </v-btn>
                <v-btn color="red" outlined @click="delete_video(item.id)">
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

export default {
  mixins: [TimeMixin],
  methods: {
    delete_video(video_id) {
      this.$store.dispatch("video/delete", video_id);
    },
    show_video(video_id) {
      router.push({ path: `/videoanalysis/${video_id}` });
    },
    async fetchData() {
      console.log("fetch");
      // Ask backend about all videos
      await this.$store.dispatch("video/listUpdate");

      await this.$store.dispatch("analyser/listUpdate", {
        addResults: false,
      });
    },
  },
  computed: {
    videos() {
      let videos = this.$store.getters["video/all"];

      videos.forEach((v) => {
        v.analysers = this.$store.getters["analyser/forVideo"](v.id);
      });
      console.log(videos);
      videos.forEach((v) => {
        v.loading = !v.analysers.reduce((a, b) => a && b.status === "D", true);
      });
      return videos;
    },
  },
  components: {
    ModalVideoUpload,
  },
  mounted() {
    this.fetchData();

    setInterval(
      function () {
        this.fetchData();
      }.bind(this),
      1000
    );
  },
};
</script>

<style>
.video-gallery > * {
  margin: 8px;
}
</style>
