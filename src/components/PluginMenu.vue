<template>
  <div>
    <v-menu v-model="menu" min-width="175" offset-y bottom left>
      <template v-slot:activator="{ attrs, on: menu }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="menu"
          class="ml-n2"
          :title="$t('plugin.menu.title')"
        >
          <v-badge
            v-if="pluginRuns.length > 0"
            color="accent"
            :content="pluginRuns.length"
          >
            <v-icon color="primary">mdi-timer-sand-empty</v-icon>
          </v-badge>
          <v-icon v-else color="primary">mdi-timer-sand-empty</v-icon>
        </v-btn>
      </template>
      <v-list-item-content class="pa-0 pr-2 plugin-overview">
        <v-list dense class="mt-2">
          <template v-for="(pluginRun, i) in pluginRuns">
            <v-list-item dense :key="pluginRun.id">
              <v-col class="pa-0 ma-0">
                <dir>
                  {{ pluginName(pluginRun.type) }}
                </dir>
                <v-progress-linear
                  :value="100 * pluginRun.progress"
                  :striped="pluginRun.status === 'ERROR'"
                  :color="progressColor(pluginRun.status)"
                >
                </v-progress-linear>
              </v-col>
            </v-list-item>
            <v-divider :key="i" v-if="i < pluginRuns.length - 1"></v-divider>
          </template>
        </v-list>
        <div class="v-btn--absolute v-btn--right v-btn--top">
          <v-btn
            :title="$t('plugin.menu.new')"
            class="mr-n1 mt-n1"
            @click="showModalPlugin = true"
            color="red"
            dark
            fab
            x-small
          >
            <v-icon dark>mdi-plus</v-icon>
          </v-btn>
        </div>
      </v-list-item-content>
    </v-menu>
    <ModalPlugin v-model="showModalPlugin">
      <activator />
    </ModalPlugin>
  </div>
</template>

<script>
import ModalPlugin from "@/components/ModalPlugin.vue";

import { mapStores } from "pinia";
import { usePlayerStore } from "@/store/player";
import { usePluginRunStore } from "@/store/plugin_run";
import { usePluginRunResultStore } from "@/store/plugin_run_result";

export default {
  data() {
    return {
      menu: false,
      showModalPlugin: false,
    };
  },
  methods: {
    progressColor(status) {
      if (status === "ERROR") {
        return "red";
      }
      if (status === "RUNNING") {
        return "blue";
      }
      if (status === "DONE") {
        return "green";
      }
      return "yellow";
    },
    pluginName(type) {
      if (type === "aggregate_scalar") {
        return this.$t("modal.plugin.aggregation.plugin_name");
      }
      if (type === "audio_amp") {
        return this.$t("modal.plugin.audio_waveform.plugin_name");
      }
      if (type === "audio_freq") {
        return this.$t("modal.plugin.audio_frequency.plugin_name");
      }
      if (type === "clip") {
        return this.$t("modal.plugin.clip.plugin_name");
      }
      if (type === "color_analysis") {
        return this.$t("modal.plugin.color_analysis.plugin_name");
      }
      if (type === "facedetection") {
        return this.$t("modal.plugin.facedetection.plugin_name");
      }
      if (type === "deepface_emotion") {
        return this.$t("modal.plugin.faceemotion.plugin_name");
      }
      if (type === "insightface_facesize") {
        return this.$t("modal.plugin.facesize.plugin_name");
      }
      if (type === "places_classification") {
        return this.$t("modal.plugin.places_classification.plugin_name");
      }
      if (type === "shotdetection") {
        return this.$t("modal.plugin.shot_detection.plugin_name");
      }
      if (type === "shot_density") {
        return this.$t("modal.plugin.shot_density.plugin_name");
      }
      if (type === "shot_type_classification") {
        return this.$t("modal.plugin.shot_type_classification.plugin_name");
      }
      if (type === "thumbnail") {
        return this.$t("modal.plugin.thumbnail.plugin_name");
      }
      return type;
    },
  },
  computed: {
    loggedIn() {
      return this.userStore.loggedIn;
    },
    pluginRuns() {
      const pluginRuns = this.pluginRunStore.forVideo(this.playerStore.videoId);
      console.log(pluginRuns);
      return pluginRuns;
    },

    ...mapStores(usePlayerStore, usePluginRunStore, usePluginRunResultStore),
  },
  components: {
    ModalPlugin,
  },
};
</script>

<style>
.v-menu__content .v-btn:not(.accent) {
  text-transform: capitalize;
  justify-content: left;
}

.v-btn:not(.v-btn--round).v-size--large {
  height: 48px;
}

.plugin-overview {
  background-color: rgb(255, 255, 255) !important;
  max-height: 500px;
  padding: 0;
  margin: 0;
}

.v-list-item__content.plugin-overview {
  min-width: 350px;
  max-width: 500px;
  letter-spacing: 0.0892857143em;
  overflow: auto;
  /* border-bottom: 1px solid #f5f5f5; */
}

.v-menu__content .plugin-overview .v-btn:not(.accent) {
  justify-content: center;
}
</style>