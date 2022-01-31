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
                {{ get_video_length(item.duration) }}
              </div>
              <div>License: {{ item.license }}</div>

              <v-card-actions>
                <v-btn outlined @click="analyse_video(item.id)">
                  <v-icon>{{ "mdi-movie-search-outline" }}</v-icon> Analyse
                </v-btn>
                <v-btn color="red" outlined @click="delete_video">
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
import ModalVideoUpload from "@/components/ModalVideoUpload.vue";

export default {
  methods: {
    get_video_length(seconds) {
      var h = Math.floor(seconds / 3600);
      var m = Math.floor((seconds % 3600) / 60);
      var s = Math.floor((seconds % 3600) % 60);

      var hDisplay = h > 0 ? h + (h == 1 ? " h " : " h ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? " min, " : " min ") : "";
      var sDisplay = s > 0 ? s + (s == 1 ? " sec" : " sec") : "";
      return hDisplay + mDisplay + sDisplay;
    },

    delete_video() {
      console.log("Delete item");
    },

    analyse_video(video_id) {
      console.log("Analyse video with id " + video_id);
      this.$store.dispatch("api/analyse_video", video_id);
    },
  },

  computed: {
    videos() {
      return this.$store.state.video.videos;
    },
  },
  components: {
    ModalVideoUpload,
  },
  mounted() {
    this.$store.dispatch("video/list");
  },
};
</script>

<style>
.video-gallery > * {
  margin: 8px;
}
</style>
