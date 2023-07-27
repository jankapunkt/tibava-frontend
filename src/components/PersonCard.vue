<template>
  <v-card 
  :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
  elevation="4"
  :loading="loading"
  >
      <v-row no-gutters align="center" class="px-2 py-0">
        <v-col cols="2">
          <v-list-item three-line>
            <v-list-item-content min-width>
              <div style="font-size: 16px; margin-bottom:0.2cm">Person {{ cluster.id }}</div>
              <v-list-item-subtitle>Faces: {{ cluster.image_paths.length }}</v-list-item-subtitle>
              <v-list-item-subtitle>First: {{ cluster.timestamps[0] }} sec</v-list-item-subtitle>
              <v-list-item-subtitle>Last: {{ cluster.timestamps[cluster.timestamps.length-1] }} sec</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>

        <v-col cols="9" style="width: 100%">
          <div class="image-container" style="width: 100%; gap: 10px; overflow-x: auto; justify-content: flex-start; display:flex; flex-direction: row;">
            <v-img 
            v-for="(item, i) in cluster.image_paths" 
            :key="i" 
            :src="item"
            contain
            style="cursor: pointer; height: 100px; max-width: 100px;"
            @click="goToFace(cluster.timestamps[i])"></v-img>
          </div>
        </v-col>

        <v-col align="end" cols="1">
          <v-menu bottom right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small>
                <v-icon v-bind="attrs" v-on="on"
                  >mdi-dots-vertical</v-icon
                >
              </v-btn>
            </template>
            <v-list>
              <v-list-item>
                <v-btn text @click="createTimeline(cluster)"> to timeline </v-btn>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
    </v-row>
  </v-card>
</template>

<script>
import TimeMixin from "../mixins/time";

import { mapStores } from "pinia";
import { usePlayerStore } from "@/store/player";
import { usePluginRunStore } from "@/store/plugin_run";

export default {
  mixins: [TimeMixin],
  props: ["cluster"],
  data () {
    return {
      // card shows loading animation while the faceidentification plugin runs
      loading: false,
    }
  },
  methods: {
    async createTimeline(cluster) {
      this.loading = true;
      let parameters = [
            {
              field: "text_field",
              name: "timeline",
              value: "Person "+ cluster.id,
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "image_input",
              file: null,
              name: "query_images",
              text: this.$t("modal.plugin.face_identification.query_images"),
              hint: this.$t(
                "modal.plugin.face_identification.query_images_hint"
              ),
            },
          ];
      parameters = parameters.concat(
        [
          {
            field: "slider",
            min: 1,
            max: 10,
            value: 2,
            step: 1,
            name: "fps",
            text: this.$t("modal.plugin.fps"),
          },
          {
            name: "embedding_ref",
            value: cluster.embedding_ref,
          },
          {
            name: "index",
            value: cluster.embedding_index,
          }
        ]
      );

      parameters = parameters.map((e) => {
        if ("file" in e) {
          return { name: e.name, file: e.file };
        } else {
          return { name: e.name, value: e.value };
        }
      });

      this.pluginRunStore
        .submit({ plugin: "insightface_identification", parameters: parameters })
        .then(() => {
          this.loading = false;
        });
      
    },
    setVideoPlayerTime(time) {
      this.playerStore.setTargetTime(time);
    },
    goToFace(time){
      this.playerStore.setTargetTime(time);
    }
  },
  computed: {
    syncTime() {
      return this.playerStore.syncTime;
    },
    ...mapStores(usePlayerStore, usePluginRunStore),
  }
};
</script>

<style>
.image-contaniner {
  overflow-x: auto;
  white-space: nowrap;
  justify-content: flex-start;
  gap: 10px;
}

</style>