<template>
  <v-app>
    <v-main>
      <v-container class="py-8 px-6" fluid>
        <v-row justify="space-around">
          <v-col cols="auto">
            <v-dialog transition="dialog-top-transition" max-width="1000">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" v-bind="attrs" v-on="on"
                  >Upload new video</v-btn
                >
              </template>
              <template v-slot:default="dialog">
                <v-card>
                  <v-toolbar color="primary" dark>Upload new video</v-toolbar>
                  <v-card-text>
                    <form>
                      <v-text-field
                        v-model="videotitle"
                        :error-messages="videotitleErrors"
                        :counter="120"
                        label="Video title"
                        required
                        @input="$v.videotitle.$touch()"
                        @blur="$v.videotitle.$touch()"
                      ></v-text-field>
                      <v-select
                        v-model="videolicense"
                        :items="videolicenses"
                        :error-messages="videolicenseErrors"
                        label="Video license"
                        required
                        @change="$v.videolicense.$touch()"
                        @blur="$v.videolicense.$touch()"
                      ></v-select>
                      <v-file-input
                        label="Select a video file [mp4, mkv, avi]"
                        filled
                        prepend-icon="mdi-movie-filter"
                      ></v-file-input>
                      <v-checkbox
                        v-model="checkbox"
                        :error-messages="checkboxErrors"
                        label="Do you agree with the terms of services?"
                        required
                        @change="$v.checkbox.$touch()"
                        @blur="$v.checkbox.$touch()"
                      ></v-checkbox>

                      <v-btn class="mr-4" @click="upload_video"> Upload </v-btn>
                      <v-btn @click="dialog.value = false">Close</v-btn>
                    </form>
                  </v-card-text>
                </v-card>
              </template>
            </v-dialog>
          </v-col>
        </v-row>

        <v-row>
          <v-col v-for="item in items" :key="item.video_id">
            <v-card
              elevation="2"
              width="400px"
              v-bind:loading="item.loading"
              v-bind:disabled="item.loading"
              outlined
              shaped
            >
              <v-card-title>{{ item.video_name }}</v-card-title>
              <v-card-text>
                <div>Video ID: {{ item.video_id }}</div>
                <div>
                  Length:
                  {{ get_video_length(item.video_frames, item.video_fps) }}
                </div>
                <div>License: {{ item.video_license }}</div>

                <v-card-actions>
                  <v-btn outlined @click="analyse_video(item.video_id)">
                    <v-icon>{{ "mdi-movie-search-outline" }}</v-icon> Analyse
                  </v-btn>
                  <v-btn color="red" outlined @click="delete_video">
                    <v-icon>{{ "mdi-trash-can-outline" }}</v-icon> Delete
                  </v-btn>
                </v-card-actions>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  methods: {
    get_video_length(video_frames, video_fps) {
      var seconds = video_frames / video_fps;

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
    upload_video() {
      console.log("Upload Video");
    },
  },
  data: () => ({
    items: [
      {
        video_id: "23189907534",
        video_name: "FF9 Trailer",
        video_frames: 200,
        video_fps: 30,
        video_license: "CC-BY-0",
        processing: "DONE!",
        loading: false,
      },
      {
        video_id: "32131234415",
        video_name: "Halloween",
        video_frames: 3500,
        video_fps: 25,
        video_license: "CC-BY-0",
        processing: "Shot Detection",
        processing_progress: 0.4,
        loading: true,
      },
    ],
    videolicenses: ["CC-BY-0", "CC-BY-2"],
  }),
};
</script>