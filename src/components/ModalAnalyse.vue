<template>
  <v-dialog v-model="show" max-width="1000">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block large>
        {{ $t("modal.analyse.title") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.analyse.title") }}

        <v-btn icon @click.native="show = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row lign="center" justify="center">
          <v-btn @click="pluginAudioWaveform" height="100px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-waveform </v-icon>
              </p>
              {{ $t("modal.analyse.audio.waveform") }}
            </div>
          </v-btn>
          <!-- <v-btn @click="pluginAudioFrequency" height="100px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-waveform </v-icon>
              </p>
              {{ $t("modal.analyse.audio.frequency") }}
            </div>
          </v-btn> -->

          <v-btn @click="pluginShotDetection" height="100px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-arrow-expand-horizontal </v-icon>
              </p>
              {{ $t("modal.analyse.shot_detection") }}
            </div>
          </v-btn>
        </v-row>
        <!-- <v-row> </v-row> -->
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn @click="show = false">{{ $t("timelineSegment.close") }}</v-btn>
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
    };
  },
  computed: {},
  methods: {
    async pluginAudioWaveform() {
      this.$store
        .dispatch("pluginRun/new", { plugin: "audio_waveform" })
        .then(() => {
          this.show = false;
        });
    },
    async pluginAudioFrequency() {
      this.$store
        .dispatch("pluginRun/new", { plugin: "audio_frequency" })
        .then(() => {
          this.show = false;
        });
    },
    async pluginShotDetection() {
      this.$store
        .dispatch("pluginRun/new", { plugin: "shotdetection" })
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
