<template>
  <v-dialog v-model="show" max-width="90%">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block large>
        {{ $t("modal.plugin.title") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.plugin.title") }}

        <v-btn icon @click.native="show = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-tabs vertical class="tabs-left">
          <v-tab v-for="plugin in plugins_sorted" :key="plugin.name">
            <v-icon left> {{ plugin.icon }} </v-icon>
            <span class="text-button">{{ plugin.name }}</span>
          </v-tab>
          <v-tab-item v-for="plugin in plugins_sorted" :key="plugin.name">
            <v-card flat height="100%">
              <v-card-title>{{ plugin.name }} </v-card-title>
              <v-card-text>
                <ModalPluginParameters :parameters="plugin.parameters">
                </ModalPluginParameters>

                <v-expansion-panels
                  v-if="
                    plugin.optional_parameters &&
                    plugin.optional_parameters.length > 0
                  "
                >
                  <v-expansion-panel>
                    <v-expansion-panel-header expand-icon="mdi-menu-down">
                      Advanced Options
                    </v-expansion-panel-header>

                    <v-expansion-panel-content>
                      <ModalPluginParameters
                        :parameters="plugin.optional_parameters"
                      >
                      </ModalPluginParameters>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>

              <v-card-actions class="pt-0">
                <v-btn
                  @click="
                    runPlugin(
                      plugin.plugin,
                      plugin.parameters,
                      plugin.optional_parameters
                    )
                  "
                  >{{ $t("modal.plugin.run") }}</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn @click="show = false">{{ $t("modal.plugin.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapStores } from "pinia";
import { usePluginRunStore } from "@/store/plugin_run";
import ModalPluginParameters from "./ModalPluginParameters.vue";
// import { useTimelineStore } from "../store/timeline";

export default {
  props: ["value"],
  data() {
    return {
      show: true,
      plugins: [
        {
          name: this.$t("modal.plugin.audio.waveform"),
          icon: "mdi-waveform",
          plugin: "audio_amp",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.audio.waveform"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [],
        },
        {
          name: this.$t("modal.plugin.audio.frequency"),
          icon: "mdi-waveform",
          plugin: "audio_freq",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.audio.frequency"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [],
        },
        {
          name: this.$t("modal.plugin.color_analysis.name"),
          icon: "mdi-palette",
          plugin: "color_analysis",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.color_analysis.name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "slider",
              min: 1,
              max: 8,
              value: 1,
              step: 1,
              name: "k",
              text: this.$t("modal.plugin.color_analysis.slider"),
            },
            // {
            //   field: "buttongroup",
            //   text: this.$t("modal.plugin.color_analysis.buttongroup"),
            //   name: "timeline_visualization",
            //   value: 0,
            //   buttons: [
            //     this.$t("modal.plugin.color_analysis.singletimeline"),
            //     this.$t("modal.plugin.color_analysis.multipletimelines"),
            //   ],
            // },
          ],
          optional_parameters: [],
        },
        {
          name: this.$t("modal.plugin.shot_detection"),
          icon: "mdi-arrow-expand-horizontal",
          plugin: "shotdetection",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.shot_detection"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [],
        },
        {
          name: this.$t("modal.plugin.shot_type_classification"),
          icon: "mdi-video-switch",
          plugin: "shot_type_classification",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.shot_type_classification"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [],
        },
        {
          name: this.$t("modal.plugin.places_classification"),
          icon: "mdi-map-marker",
          plugin: "places_classification",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.places_classification"),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "select_timeline",
              name: "shot_timeline_id",
              // value: this.shot_timelines_names[0],
              // items: this.shot_timelines_names,
              text: this.$t("modal.plugin.shot_timeline_name"),
              hint: this.$t("modal.plugin.shot_timeline_hint"),
            },
          ],
          optional_parameters: [],
        },
        // {
        //   name: this.$t("modal.plugin.facedetection"),
        //   icon: "mdi-face-recognition",
        //   plugin: "insightface_detection",
        //   parameters: [
        //     {
        //       field: "text_field",
        //       name: "timeline",
        //       value: this.$t("modal.plugin.facedetection"),
        //       text: this.$t("modal.plugin.timeline_name"),
        //     },
        //   ],
        // },
        {
          name: this.$t("modal.plugin.facesize"),
          icon: "mdi-face-recognition",
          plugin: "insightface_facesize",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.facesize"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [],
        },
        {
          name: this.$t("modal.plugin.faceemotion"),
          icon: "mdi-emoticon-happy-outline",
          plugin: "deepface_emotion",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.faceemotion"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [],
        },
        {
          name: this.$t("modal.plugin.thumbnail"),
          icon: "mdi-image-multiple",
          plugin: "thumbnail",
          parameters: [],
        },
        {
          name: this.$t("modal.plugin.clip.probability"),
          icon: "mdi-eye",
          plugin: "clip",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.clip.probability"),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "text_field",
              name: "search_term",
              value: "",
              text: this.$t("modal.plugin.clip.search_term"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.clip.fps"),
            },
          ],
        },
      ],
    };
  },
  computed: {
    // plugins() {
    //   return []; //this._plugins;
    // },

    plugins_sorted() {
      return this.plugins.sort((a, b) => a.name.localeCompare(b.name));
    },
    ...mapStores(usePluginRunStore),
  },
  methods: {
    async runPlugin(plugin, parameters, optional_parameters) {
      parameters = parameters.concat(optional_parameters);
      parameters = parameters.map((e) => {
        return { name: e.name, value: e.value };
      });
      this.pluginRunStore
        .submit({ plugin: plugin, parameters: parameters })
        .then(() => {
          this.show = false;
        });
    },
  },
  watch: {
    value(value) {
      if (value) {
        this.show = value;
      }
    },
    show(value) {
      if (value) {
        this.$emit("close");
      }
    },
  },
  components: { ModalPluginParameters },
};
</script>

<style>
div.tabs-left [role="tab"] {
  justify-content: flex-start;
}
</style>

