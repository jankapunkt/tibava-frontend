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
            <v-card-title>{{ item.meta.name }}</v-card-title>
            <v-card-text>
              <div>Video ID: {{ item.id }}</div>
              <div>
                Length:
                {{ get_display_time(item.meta.duration) }}
              </div>
              <div>License: {{ item.meta.license }}</div>

              <v-card-actions>
                <v-btn outlined @click="show_video(item.hash_id)">
                  <v-icon>{{ "mdi-movie-search-outline" }}</v-icon> Analyse
                </v-btn>
                <v-btn color="red" outlined @click="delete_video(item.hash_id)">
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
import { get_display_time as helper_get_display_time } from "@/plugins/helpers.js";

export default {
  methods: {
    delete_video(video_hash_id) {
      this.$store.dispatch("video/delete", video_hash_id);
    },
    show_video(video_hash_id) {
      console.log(video_hash_id);
      router.push({ path: `/videoanalysis/${video_hash_id}` });
      // router.push({
      //   name: "Videoanalysis",
      //   params: { hash_id: video_hash_id },
      // });
    },
    get_display_time: helper_get_display_time,
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
    // Ask backend about all videos
    this.$store.dispatch("video/list");
  },
};
</script>

<style>
.video-gallery > * {
  margin: 8px;
}
</style>
