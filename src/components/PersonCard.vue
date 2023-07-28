<template>
  <v-card 
  :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
  elevation="4"
  :loading="loading"
  >
      <v-row no-gutters align="center" class="px-2 py-0">
        <v-col cols="3">
            <v-list-item-content min-width>
              <div style="font-size: 16px;"> {{ name }}
                <v-menu bottom right>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon size="16">
                      <v-icon v-bind="attrs" v-on="on">mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item>
                      <v-dialog v-model="show" max-width="1000">
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" text block large>
                            {{ $t("modal.timeline.rename.link") }}
                          </v-btn>
                        </template>
                        <v-card>
                          <v-card-title class="mb-2">
                            {{ $t("modal.timeline.rename.title") }}
                            <v-btn icon @click.native="show = false" absolute top right>
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </v-card-title>
                          <v-card-text>
                            <v-text-field
                              :label="$t('modal.timeline.rename.name')"
                              prepend-icon="mdi-pencil"
                              v-model="name"
                            ></v-text-field>
                          </v-card-text>
                          <v-card-actions class="pt-0">
                            <v-btn class="mr-4" @click="submit" :disabled="isSubmitting || !name">
                              {{ $t("modal.timeline.rename.update") }}
                            </v-btn>
                            <v-btn @click="show = false">{{
                              $t("modal.timeline.rename.close")
                            }}</v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
              <v-list-item-subtitle>Faces: {{ cluster.image_paths.length }}</v-list-item-subtitle>
              <v-list-item-subtitle>First: {{ cluster.timestamps[0] }} sec</v-list-item-subtitle>
              <v-list-item-subtitle>Last: {{ cluster.timestamps[cluster.timestamps.length-1] }} sec</v-list-item-subtitle>
            </v-list-item-content>
        </v-col>

        <v-col cols="8" style="width: 100%">
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
import { usePluginRunResultStore } from "@/store/plugin_run_result";
import { useTimelineStore } from "@/store/timeline";
import { cluster } from "d3";

export default {
  mixins: [TimeMixin],
  props: ["cluster"],
  data () {
    return {
      // card shows loading animation while the faceidentification plugin runs
      loading: false,
      show: false,
      isSubmitting: false,
      hasTimeline: false,
      nameProxy: "Person " + String(this.cluster.id),
    }
  },
  mounted() {
    const check = this.usePluginRunResultStore.forPluginRun(this.cluster.plugin_run_id);
    console.log(check); 
  },
  methods: {
    async submit() {
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;
      
      if (this.hasTimeline){
        console.log("drin");
        const timeline = this.timelineStore.getByName(this.nameProxy)[0];

        await this.timelineStore.rename({
          timelineId: timeline,
          name: this.nameProxy,
        });
      }
      console.log("3");
      console.log(this.hasTimeline);

      this.isSubmitting = false;
      this.show = false;
    },
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
          this.hasTimeline=true;
        });

    },
    setVideoPlayerTime(time) {
      this.playerStore.setTargetTime(time);
    },
    goToFace(time){
      this.playerStore.setTargetTime(time);
    },

  },
  computed: {
    name: {
      get() {
          console.log(this.cluster.id);
          console.log(this.hasTimeline);

          return this.hasTimeline ? this.timelineStore.getByName(this.nameProxy)[0].name : this.nameProxy;
      },
      set(val) {
        this.nameProxy = val;
      },
    },
    syncTime() {
      return this.playerStore.syncTime;
    },
    ...mapStores(usePlayerStore, usePluginRunStore, useTimelineStore),
  },
  watch: {
    show(value) {
      if (value) {
        this.$emit("close");
      }
    },
  },
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