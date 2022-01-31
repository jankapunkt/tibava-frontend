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
            :error-messages="videotitleErrors"
            :counter="120"
            label="Video title"
            required
          ></v-text-field>
          <v-select
            v-model="video.license"
            :items="licenses"
            :error-messages="videolicenseErrors"
            label="Video license"
            required
          ></v-select>
          <v-file-input
            v-model="video.file"
            label="Select a video file [mp4, mkv, avi]"
            filled
            prepend-icon="mdi-movie-filter"
          ></v-file-input>
          <v-checkbox
            v-model="checkbox"
            :error-messages="checkboxErrors"
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
      this.$store.dispatch("video/upload", this.video);
      //   TODO wait until signal is fired
      //   this.dialog = false;
    },
  },
};
</script>
