<template>
  <v-dialog v-model="show" max-width="1000">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block large>
        <v-icon left>{{ "mdi-chart-line-variant" }}</v-icon>
        {{ $t("modal.timeline.visualization.link") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.timeline.visualization.title") }}

        <v-btn icon @click.native="show = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-col cols="12" class="py-2">
          <v-btn-toggle v-model="visualization_idx" borderless>
            <v-btn
              class="mr-4"
              v-for="visualization_option in visualization_options"
              :key="visualization_option.label"
            >
              {{ visualization_option.label }}
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn class="mr-4" @click="submit" :disable="isSubmitting">
          {{ $t("modal.timeline.visualization.update") }}
        </v-btn>
        <v-btn @click="show = false">{{
          $t("modal.timeline.visualization.close")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";
import { mapStores } from "pinia";
import { useTimelineStore } from "@/store/timeline";
import { usePluginRunResultStore } from "@/store/plugin_run_result"

export default {
  props: ["timeline"],
  data() {
    return {
      show: false,
      isSubmitting: false,
      visualization_idx: null,
      visualization_proxy: null,
      visualization_options: [],
      items: [],
    };
  },
  computed: {
    timeline_type() {
      const timeline = this.timelineStore.get(this.timeline);

      if (timeline.type == "PLUGIN_RESULT" && "plugin_run_result_id" in timeline) {
        const result = this.pluginRunResultStore.get(
          timeline.plugin_run_result_id
        );
        if (result) {
          timeline.plugin = { data: result.data, type: result.type };
        }
      }
      return timeline.plugin.type;
    },
    visualization: {
      get() {
        const timeline = this.timelineStore.get(this.timeline);
        return this.visualization_proxy === null
          ? timeline.visualization
          : this.visualization_proxy;
      },
      set(val) {
        this.visualization_proxy = val;
      },
    },
    ...mapStores(useTimelineStore, usePluginRunResultStore)
  },
  methods: {
    async submit() {
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;
      await this.timelineStore.changeVisualization({
        timelineId: this.timeline,
        visualization: this.visualization_options[this.visualization_idx].value,
      });

      this.isSubmitting = false;
      this.show = false;
    },
  },
  watch: {
    show(value) {
      if (value) {
        this.nameProxy = null;

        // S - SCALAR_DATA
        console.log(this.timeline_type);
        console.log(this.visualization);

        if (this.timeline_type == "SCALAR") {
          this.visualization_options = [
            { label: "Line Chart", value: "SCALAR_LINE" }, // SL - SCALAR_LINE
            { label: "Color Chart", value: "SCALAR_COLOR" }, // SC - SCALAR_COLOR
          ];

          var visualization_lut = { SCALAR_LINE: 0, SCALAR_COLOR: 1 };
        }

        // TODO other data types

        // preselect button with current visualization option
        if (this.visualization in visualization_lut) {
          this.visualization_idx = visualization_lut[this.visualization];
        }

        this.$emit("close");
      }
    },
  },
};
</script>



