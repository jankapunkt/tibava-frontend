<template>
  <v-card :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']" 
          style="
            text-align: center;
          "
          flat color="transparent"
          width="300">
          <v-text v-if="!canUpload" class="red--text">You have uploaded the maximum amount of videos that you are allowed to. If you require more, please contact TODO.</v-text>
          <v-text v-if="canUpload">Videos uploaded: {{ num_videos }} / {{  allowance }}</v-text>
  <v-dialog v-model="dialog" max-width="1000">
      <template v-slot:activator="{on, attrs}">
        <v-btn 
        :disabled="!canUpload" 
        color="primary" v-bind="attrs" v-on="on"
        >
        Upload new video<v-icon right>{{ "mdi-plus-circle" }}</v-icon>
        </v-btn>
      </template>
    <v-card>
      <v-toolbar color="primary" dark>Upload new video</v-toolbar>
      <v-card-text>
        <v-form>
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

            <v-list-item-group v-model="selected_analysers" multiple>
              <template v-for="item in analysers">
                <v-list-item
                  :value="item.model"
                  :disabled="item.disabled"
                >
                  <template v-slot:default="{ active }">
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="item.label"
                      ></v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-checkbox
                        :disabled="item.disabled"
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

          <v-progress-linear
            v-if="isUploading"
            :value="uploadingProgress"
            class="mb-2"
          ></v-progress-linear>

          <v-btn class="mr-4" :disabled="disabled" @click="upload_video">
            Upload
          </v-btn>
          <v-btn @click="dialog = false">Close</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</v-card>
</template>

<script>


import { mapStores } from 'pinia'
import { useVideoUploadStore } from "@/store/video_upload"
import { useUserStore } from "@/store/user"
import { useVideoStore } from "@/store/video"

export default {
  data() {
    return {
      video: {},
      analysers: [
        {
          label: "Shot Detection",
          disabled: false,
          model: "shotdetection",
        },
        {
          label: "Scene Recognition (coming soon)",
          disabled: true,
          model: "scenerecognition",
        },
        {
          label: "Person Recognition (coming soon)",
          disabled: true,
          model: "personrecognition",
        },
        {
          label: "Emotion Recognition (coming soon)",
          disabled: true,
          model: "emotionrecognition",
        },
      ],
      selected_analysers: ["shotdetection"],
      licenses: ["CC-BY-0", "CC-BY-2"],
      checkbox: false,
      dialog: false
    };
  },
  computed: {
    canUpload(){
      return this.userStore.allowance > this.videoStore.all.length;
    },
    disabled() {
      if (this.checkbox) {
        return false;
      }
      return true;
    },
    isUploading() {
      return this.videoUploadStore.isUploading;
    },
    uploadingProgress() {
      return this.videoUploadStore.progress;
    },    
    allowance() {
      return this.userStore.allowance;
    },
    num_videos() {
      return this.videoStore.all.length;
    },
    ...mapStores(useVideoUploadStore, useUserStore, useVideoStore)
  },
  methods: {
    async upload_video() {
      const params = {
        video: this.video,
        analyser: this.selected_analysers,
      };

      await this.videoUploadStore.upload(params);
      //   TODO wait until signal is fired

      this.dialog = false;
    },
  },
};
</script>
