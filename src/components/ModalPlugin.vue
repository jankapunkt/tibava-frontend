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
          <v-tab v-for="plugin in plugins" :key="plugin.name">
            <v-icon left> {{ plugin.icon }} </v-icon>
            <span class="text-button">{{ plugin.name }}</span>
          </v-tab>
          <v-tab-item v-for="plugin in plugins" :key="plugin.name">
            <v-card flat height="100%">
              <v-card-title>{{ plugin.name }} </v-card-title>
              <v-card-text>
                <template v-for="parameter in plugin.parameters">
                  <v-text-field
                    v-model="parameter.value"
                    :label="parameter.text"
                    v-if="parameter.field == 'text_field'"
                    :key="parameter.name"
                  ></v-text-field>

                  <div v-if="parameter.field == 'slider'" :key="parameter.name">
                    <!-- <p>
                      {{ parameter.text }}
                    </p> -->

                    <v-slider
                      v-model="parameter.value"
                      :label="parameter.text"
                      :min="parameter.min"
                      :max="parameter.max"
                      :step="parameter.step"
                      :value="parameter.default"
                      thumb-label="always"
                    ></v-slider>
                  </div>

                  <div
                    v-if="parameter.field == 'buttongroup'"
                    :key="parameter.name"
                  >
                    <p>
                      {{ parameter.text }}
                    </p>
                    <v-btn-toggle
                      v-model="parameter.value"
                      :label="parameter.text"
                      tile
                      group
                      mandatory
                    >
                      <v-btn v-for="button in parameter.buttons" :key="button">
                        {{ button }}
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                </template>
              </v-card-text>

              <v-card-actions class="pt-0">
                <v-btn @click="runPlugin(plugin.plugin, plugin.parameters)">{{
                  $t("modal.plugin.run")
                }}</v-btn>
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
export default {
  props: [],
  data() {
    return {
      show: false,
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
        },
        {
          name: this.$t("modal.plugin.audio.frequency"),
          icon: "mdi-waveform",
          plugin: "audio_freq",
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
              value: this.$t("modal.plugin.clip.name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "text_field",
              name: "search_term",
              value:"",
              text: this.$t("modal.plugin.clip.search_term"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.shot_detection"),
          icon: "mdi-arrow-expand-horizontal",
          plugin: "shotdetection",
          parameters: [],
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
            {
              field: "buttongroup",
              text: this.$t("modal.plugin.color_analysis.buttongroup"),
              name: "timeline_visualization",
              value: 0,
              buttons: [
                this.$t("modal.plugin.color_analysis.singletimeline"),
                this.$t("modal.plugin.color_analysis.multipletimelines"),
              ],
            },
          ],
        },
        {
          name: this.$t("modal.plugin.thumbnail"),
          icon: "mdi-image-multiple",
          plugin: "thumbnail",
          parameters: [],
        },
      ],
    };
  },
  computed: {
    // plugins() {
    //   return []; //this._plugins;
    // },
  },
  methods: {
    async runPlugin(plugin, parameters) {
      parameters = parameters.map((e) => {
        return { name: e.name, value: e.value };
      });
      console.log(`${plugin}, ${JSON.stringify(parameters)}`);
      this.$store
        .dispatch("pluginRun/new", { plugin: plugin, parameters: parameters })
        .then(() => {
          this.show = false;
        });
    },
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
div.tabs-left [role="tab"] {
  justify-content: flex-start;
}
</style>

