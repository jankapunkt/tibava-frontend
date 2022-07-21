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
          name: this.$t("modal.plugin.audio_waveform.plugin_name"),
          icon: "mdi-waveform",
          plugin: "audio_amp",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.audio_waveform.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1000,
              max: 24000,
              value: 8000,
              step: 1000,
              name: "sr",
              text: this.$t("modal.plugin.audio_waveform.sr"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.audio_frequency.plugin_name"),
          icon: "mdi-waveform",
          plugin: "audio_freq",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.audio_frequency.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1000,
              max: 24000,
              value: 8000,
              step: 1000,
              name: "sr",
              text: this.$t("modal.plugin.audio_frequency.sr"),
            },
            {
              field: "slider",
              min: 64,
              max: 512,
              value: 256,
              step: 64, // TODO: only valid for values with power of 2
              name: "n_fft",
              text: this.$t("modal.plugin.audio_frequency.n_fft"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.color_analysis.plugin_name"),
          icon: "mdi-palette",
          plugin: "color_analysis",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.color_analysis.timeline_name"),
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
          optional_parameters: [
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
              field: "slider",
              min: 24,
              max: 128,
              value: 48,
              step: 4,
              name: "max_resolution",
              text: this.$t("modal.plugin.color_analysis.max_resolution"),
            },
            {
              field: "slider",
              min: 5,
              max: 25,
              value: 10,
              step: 5,
              name: "max_iter",
              text: this.$t("modal.plugin.color_analysis.max_iter"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.shot_detection.plugin_name"),
          icon: "mdi-arrow-expand-horizontal",
          plugin: "shotdetection",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.shot_detection.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
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
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.shot_type_classification.plugin_name"),
          icon: "mdi-video-switch",
          plugin: "shot_type_classification",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t(
                "modal.plugin.shot_type_classification.timeline_name"
              ),
              text: this.$t("modal.plugin.timeline_name"),
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
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.places_classification.plugin_name"),
          icon: "mdi-map-marker",
          plugin: "places_classification",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t(
                "modal.plugin.places_classification.timeline_name"
              ),
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
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        // {
        //   name: this.$t("modal.plugin.facedetection.plugin_name"),
        //   icon: "mdi-face-recognition",
        //   plugin: "insightface_detection",
        //   parameters: [
        //     {
        //       field: "text_field",
        //       name: "timeline",
        //       value: this.$t("modal.plugin.facedetection.timeline_name"),
        //       text: this.$t("modal.plugin.timeline_name"),
        //     },
        //   ],
        //   optional_parameters: [
        //     {
        //       field: "slider",
        //       min: 1,
        //       max: 10,
        //       value: 2,
        //       step: 1,
        //       name: "fps",
        //       text: this.$t("modal.plugin.fps"),
        //     },
        //   ],
        // },
        {
          name: this.$t("modal.plugin.facesize.plugin_name"),
          icon: "mdi-face-recognition",
          plugin: "insightface_facesize",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.facesize.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
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
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.faceemotion.plugin_name"),
          icon: "mdi-emoticon-happy-outline",
          plugin: "deepface_emotion",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.faceemotion.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
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
              text: this.$t("modal.plugin.fps"),
            },
            {
              field: "slider",
              min: 24,
              max: 256,
              value: 48,
              step: 8,
              name: "min_facesize",
              text: this.$t("modal.plugin.faceemotion.min_facesize"),
              disabled: true,
            },
          ],
        },
        {
          name: this.$t("modal.plugin.thumbnail.plugin_name"),
          icon: "mdi-image-multiple",
          plugin: "thumbnail",
          parameters: [],
        },
        {
          name: this.$t("modal.plugin.clip.plugin_name"),
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
              text: this.$t("modal.plugin.fps"),
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

