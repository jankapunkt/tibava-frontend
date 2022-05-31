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
        <v-tabs vertical>
          <v-tab v-for="plugin in plugins" :key="plugin.name">
            <v-icon left> {{ plugin.icon }} </v-icon>
            {{ plugin.name }}
          </v-tab>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <p>
                  Sed aliquam ultrices mauris. Donec posuere vulputate arcu.
                  Morbi ac felis. Etiam feugiat lorem non metus. Sed a libero.
                </p>

                <p>
                  Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel,
                  lacus. Aenean tellus metus, bibendum sed, posuere ac, mattis
                  non, nunc. Aliquam lobortis. Aliquam lobortis. Suspendisse non
                  nisl sit amet velit hendrerit rutrum.
                </p>

                <p class="mb-0">
                  Phasellus dolor. Fusce neque. Fusce fermentum odio nec arcu.
                  Pellentesque libero tortor, tincidunt et, tincidunt eget,
                  semper nec, quam. Phasellus blandit leo ut odio.
                </p>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>

        <v-row lign="center" justify="center">
          <v-btn @click="pluginAudioWaveform" height="80px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-waveform </v-icon>
              </p>
              {{ $t("modal.analyse.audio_waveform") }}
            </div>
          </v-btn>
          <!-- <v-btn @click="pluginAudioFrequency" height="80px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-waveform </v-icon>
              </p>
              {{ $t("modal.analyse.audio.frequency") }}
            </div>
          </v-btn> -->

          <v-btn @click="pluginShotDetection" height="80px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-arrow-expand-horizontal </v-icon>
              </p>
              {{ $t("modal.analyse.shot_detection") }}
            </div>
          </v-btn>

          <v-btn @click="pluginThumbnail" height="80px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-arrow-expand-horizontal </v-icon>
              </p>
              {{ $t("modal.analyse.thumbnail") }}
            </div>
          </v-btn>
          <v-btn @click="pluginMeanColor" height="80px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-palette </v-icon>
              </p>
              {{ $t("modal.analyse.mean_color") }}
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
      plugins: [
        {
          name: this.$t("modal.analyse.thumbnail"),
          //   icon: "mdi-arrow-expand-horizontal",
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
    async pluginAudioWaveform() {
      this.$store
        .dispatch("pluginRun/new", { plugin: "audio_amp" })
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
    async pluginMeanColor() {
      this.$store
        .dispatch("pluginRun/new", { plugin: "mean_color" })
        .then(() => {
          this.show = false;
        });
    },
    async pluginThumbnail() {
      this.$store
        .dispatch("pluginRun/new", { plugin: "thumbnail" })
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
