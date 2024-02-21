<template>
  <v-row>
    <v-col cols="3">
      <h5 class="mt-6 subtitle-2">Timelines</h5>
      <v-list dense>
        <v-list-item v-for="timeline in timelineSettings" :key="timeline.name">
          <v-list-item-action>
            <v-checkbox v-model="timeline.active"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title :class="{'grey--text': !timeline.active}">{{ timeline.name }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-text-field
              :disabled="!timeline.active"
              v-model="timeline.threshold"
              hide-details
              step="0.1"
              single-line
              type="number"
              min="0"
              max="1"
              style="width: 60px"
            ></v-text-field>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-col>
    <v-col cols="9">
      <div v-show="!loading" ref="visualizationTimelineConstellationGraph" style="height: 500px"></div>
      <div v-if="loading" class="mx-auto text-center mt-10" style="height: 500px">
          <div class="spinner">
              <i class="mdi mdi-loading mdi-spin"></i>
          </div>
          <div class="loading-text">Loading...</div>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { mapStores } from "pinia";
import { useTimelineStore } from "@/store/timeline";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import Vue from "vue";


export default {
  data() {
    return {
      timelineSettings: {},
      network: null,
      loading: false
    };
  },
  mounted() {
    this.updateTimelineSettings();
    this.renderGraph();
  },
  methods: {
    updateTimelineSettings() {
      let previous = Object.keys(this.timelineSettings);
      for (let timeline of this.timelines) {
        Vue.set(this.timelineSettings, timeline.id, {
          active: false,
          threshold: 0.5,
          name: timeline.name
        });
        previous.splice(previous.indexOf(timeline.id), 1);
      }
      for (let key of previous) {
        Vue.delete(this.timelineSettings, key);
      }
    },
    renderGraph() {
      const options = {
          nodes: {
              color: { background: '#ffffff', border: '#ae1313', highlight: '#ae1313' },
              shape: 'dot',
              font: { size: 25, },
              borderWidth: 2,
              shadow: true,
              scaling: { max: 50 }
          },
          edges: {
              length: 300,
              smooth: { forceDirection: "none" }
          },
      };
      if (this.network) {
        this.network.destroy()
      }
      this.$nextTick(() => {
        const container = this.$refs.visualizationTimelineConstellationGraph;
        this.network = new Network(container, this.getConstellations(), options);
        this.loading = false;
      });
    },
    calcTimelineOverlap(data1, data2, threshold) {
      let i1 = 0, i2 = 0;
      let counter = 0;
      const len1 = data1.time.length;
      const len2 = data2.time.length;

      while (i1 < len1 && i2 < len2) {
        const t1 = data1.time[i1];
        const t2 = data2.time[i2];

        if (t1 === t2 && Math.min(data1.y[i1], data2.y[i2]) >= threshold) {
          counter++;
          i1++;
          i2++;
        } else if (t1 < t2) {
          i1++;
        } else {
          i2++;
        }
      }
      return counter;
    },
    countAppearance(data, threshold) {
      return data.y.filter(v => v >= threshold).reduce((v1, v2) => v1 + v2, 0);
    },
    getConstellations() {
      const active_timelines = this.timelines.filter((t) => this.timelineSettings[t.id].active);
      const nodes = new DataSet(
        active_timelines.map((t) => ({
          id: t.id,
          label: t.name,
          value: this.countAppearance(t.plugin.data, this.timelineSettings[t.id].threshold)
        }))
      );

      // build all combinations of two timelines
      const node_combinations = active_timelines.flatMap((v, i) =>
        active_timelines.slice(i + 1).map((w) => [v, w])
      );
      const edges = new DataSet(
        node_combinations.map((c) => ({
          from: c[0].id,
          to: c[1].id,
          id: c[0].id + c[1].id,
          value: this.calcTimelineOverlap(
            c[0].plugin.data,
            c[1].plugin.data,
            Math.min(this.timelineSettings[c[0].id].threshold, this.timelineSettings[c[1].id].threshold),
          )
        }))
      );

      return { nodes: nodes, edges: edges };
    },
  },
  computed: {
    timelines() {
      return this.timelineStore
        .all
        .filter((timeline) => timeline.type === "PLUGIN_RESULT" && timeline.plugin.type === 'SCALAR');
    },
    ...mapStores(useTimelineStore),
  },
  watch: {
    timelines() {
      this.updateTimelineSettings();
    },
    'timelineSettings': {
      handler: function() {
        this.loading = true;
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(this.renderGraph, 1000);
      },
      deep: true
    }
  },
};
</script>