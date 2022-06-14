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
        <v-tabs vertical>
          <v-tab class="text-left" v-for="plugin in plugins" :key="plugin.name">
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
                    :label="parameter.label"
                    v-if="parameter.field == 'text_field'"
                    :key="parameter.name"
                  ></v-text-field>
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
              value: "audio amplitude",
              label: this.$t("modal.plugin.timeline_name"),
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
          name: this.$t("modal.plugin.shot_detection"),
          icon: "mdi-arrow-expand-horizontal",
          plugin: "shotdetection",
          parameters: [],
        },
        {
          name: this.$t("modal.plugin.color_analysis"),
          icon: "mdi-palette",
          plugin: "color_analysis",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: "color analysis",
              label: this.$t("modal.plugin.timeline_name"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.shot_type_classification"),
          icon: "mdi-video-switch",
          plugin: "shot_type_classification",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: "shot type classification",
              label: this.$t("modal.plugin.timeline_name"),
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
