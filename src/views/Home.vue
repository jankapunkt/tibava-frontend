<template>
  <v-app>
    <v-main>
      <v-container v-if="userStore.loggedIn" class="py-8 px-6" fluid>
        <v-row justify="space-around">
          <v-col cols="auto">
            <ModalVideoUpload />
          </v-col>
        </v-row>

        <v-container class="d-flex flex-wrap video-gallery align-content-center">
          <v-card elevation="2" width="400px" :loading="item.loading" v-for="item in videos" :key="item.id">
            <v-card-title>{{ item.name }}</v-card-title>
            <v-card-text>
              <div>Video ID: {{ item.id }}</div>
              <div>
                Length:
                {{ get_display_time(item.duration) }}
              </div>
              <div>License: {{ item.license }}</div>
              <div>Uploaded: {{ item.date.slice(0, 10) }}</div>
              <div>Timelines: {{ item.num_timelines }}</div>

              <v-card-actions class="actions">
                <v-btn outlined @click="showVideo(item.id)">
                  <v-icon>{{ "mdi-movie-search-outline" }}</v-icon> Analyse
                </v-btn>
                <ModalVideoRename :video="item.id">
                  <template v-slot:activator="on">
                    <v-btn outlined v-on="on">
                      <v-icon left>{{ "mdi-pencil" }}</v-icon>
                      {{ $t("modal.video.rename.link") }}
                    </v-btn>
                  </template>
                </ModalVideoRename>
                <!-- <ModalVideoRename :video="item.id" /> -->
                <v-btn color="red" outlined @click="deleteVideo(item.id)">
                  <v-icon>{{ "mdi-trash-can-outline" }}</v-icon> Delete
                </v-btn>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </v-container>
      </v-container>
      <v-container v-else>
        <v-col justify="space-around">
          <v-card class="welcome pa-5">
            <v-card-title>
              <h1 class="text-h2">{{ $t("welcome.title") }}</h1>
            </v-card-title>

            <v-card-text>
              <p v-html="$t('welcome.text')"></p>
              <h2 class="text-h5 mb-2">{{ $t("welcome.demo_title") }}</h2>
              <p>
                <video id = "welcome-video" controls>
                  <source
                    src="https://tib.eu/cloud/s/sMmqWqWYict3Zpb/download/TIB-AV-A_Einfuehrung_2.mp4"
                    type="video/mp4"
                  />
                </video>
              </p>
              <h2 class="text-h5 mb-1 mt-4">{{ $t("welcome.login_title") }}</h2>
              <p v-html="$t('welcome.login_text')"></p>
              <h2 class="text-h5 mb-1 mt-4">{{ $t("welcome.format_title") }}</h2>
              <p v-html="$t('welcome.format_text')"></p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import router from "../router";
import ModalVideoUpload from "@/components/ModalVideoUpload.vue";
import ModalVideoRename from "@/components/ModalVideoRename.vue";
import TimeMixin from "../mixins/time";
import { mapStores } from "pinia";
import { useVideoStore } from "@/store/video.js";
import { useUserStore } from "@/store/user.js";
import { usePluginRunStore } from "@/store/plugin_run.js";

export default {
  mixins: [TimeMixin],
  mounted() {
    this.fetchData();
  },
  methods: {
    deleteVideo(video_id) {
      console.log(video_id);
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
      // console.log(videos);
      // videos.forEach((v) => {
      //   v.pluginRuns = this.pluginRunStore.fetchForVideo(v.id);
      // });
      // videos.forEach((v) => {
      //   v.loading = !v.pluginRuns.reduce((a, b) => a && b.status === "D", true);
      // });
      return videos;
    },
    ...mapStores(useVideoStore, usePluginRunStore, useUserStore),
  },
  watch: {
    "userStore.loggedIn": function(value, oldValue) {
      if (!oldValue && value) {
        // fetch user's videos after login
        this.fetchData();
      }
    }
  },
  components: {
    ModalVideoUpload,
    ModalVideoRename,
  },
};
</script>

<style>
.v-card__title {
  display: block !important;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
}

.video-gallery>* {
  margin: 8px;
}

.video-gallery>* {
  margin: 8px;
}

.actions>.v-btn:not(:first-child) {
  margin-left: 8px !important;
}
#welcome-video {
  margin-left: auto;
  margin-right: auto;
  display: block;
  border-style: outset;
  border-color: black;
  max-width: 800px
}
</style>
