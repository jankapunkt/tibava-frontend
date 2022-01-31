<template>
  <v-dialog v-model="dialog" max-width="1000">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" v-bind="attrs" v-on="on">Upload new video</v-btn>
    </template>
    <v-card>
      <v-toolbar color="primary" dark>Upload new video</v-toolbar>
      <v-card-text>
        <form>
          <v-text-field
            v-model="video.title"
            :counter="120"
            label="Video title"
            required
          ></v-text-field>
          <v-select
            v-model="video.license"
            :items="licenses"
            label="Video license"
            required
          ></v-select>
          <v-file-input
            v-model="video.file"
            label="Select a video file [mp4, mkv, avi]"
            filled
            prepend-icon="mdi-movie-filter"
          ></v-file-input>

          <v-list>
            <v-subheader>Please select the analysis steps</v-subheader>

            <v-list-item-group v-model="model" multiple>
              <template v-for="item in analysers">
                <v-list-item
                  :key="item.model"
                  :value="item.model"
                  v-bind:disabled="item.disabled"
                >
                  <template v-slot:default="{ active }">
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="item.label"
                      ></v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-checkbox
                        v-bind:disabled="item.disabled"
                        v-model="item.active"
                        :input-value="active"
                      ></v-checkbox>
                    </v-list-item-action>
                  </template>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>

          <v-checkbox
            v-model="checkbox"
            label="Do you agree with the terms of services?"
            required
          >
          </v-checkbox>

          <v-btn class="mr-4" :disabled="disabled" @click="upload_video">
            Upload
          </v-btn>
          <v-btn @click="dialog = false">Close</v-btn>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      video: {},
      analysers: [
        {
          label: "Shot Detection",
          active: true,
          disabled: false,
          model: "cb_shotdetection",
        },
        {
          label: "Scene Recognition (coming soon)",
          active: false,
          disabled: true,
          model: "cb_scenerecognition",
        },
        {
          label: "Person Recognition (coming soon)",
          active: false,
          disabled: true,
          model: "cb_personrecognition",
        },
        {
          label: "Emotion Recognition (coming soon)",
          active: false,
          disabled: true,
          model: "cb_emotionrecognition",
        },
      ],
      model: ["Shot Detection"],
      licenses: ["CC-BY-0", "CC-BY-2"],
      checkbox: false,
      dialog: false,
    };
  },
  computed: {
    disabled() {
      if (this.checkbox) {
        return false;
      }
      return true;
    },
  },
  methods: {
    upload_video() {
      let video = this.video;
      video["analysers"] = this.analysers;
      this.$store.dispatch("video/upload", video);
      //   TODO wait until signal is fired
      //   this.dialog = false;
    },
  },
};
</script>
