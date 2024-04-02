<template>
  <v-row>
    <v-col cols="3" style="max-height: 700px" class="overflow-y-auto">
      <h5 class="mt-6 subtitle-2">Filter</h5>
      <v-list dense>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Minimum Cluster Size</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-text-field
              v-model="min_node"
              hide-details
              step="1"
              single-line
              type="number"
              label="Minimum Cluster Size"
              min="1"
              style="width: 60px"></v-text-field>
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Minimum Relations</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-text-field
              v-model="min_edge"
              hide-details
              step="1"
              single-line
              type="number"
              label="Minimum Relations"
              min="1"
              style="width: 60px"></v-text-field>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <h5 class="mt-6 subtitle-2">Timelines</h5>
      <v-list dense>
        <v-list-item v-for="timeline in visibleTimelines" :key="timeline.id">
          <v-list-item-action>
            <v-checkbox v-model="timeline.active"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title :class="{ 'grey--text': !timeline.active }">{{ timeline.name }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-menu
              :disabled="!timeline.active"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  disable
                  icon
                  x-small
                  :color="timeline.color"
                  class="mr-1"
                  v-on="on"
                >
                  <v-icon>{{ "mdi-palette" }}</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-0">
                  <v-color-picker v-model="timeline.color" flat />
                </v-card-text>
              </v-card>
            </v-menu>
          </v-list-item-action>
          <v-list-item-action>
            <v-text-field :disabled="!timeline.active" v-model="timeline.threshold" hide-details step="0.1" single-line
              type="number" min="0" max="1" style="width: 60px"></v-text-field>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-col>
    <v-col cols="9">
      <div v-show="!loading" ref="visualizationTimelineConstellationGraph" style="min-height: 500px; height: 85%"></div>
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
      loading: false,
      min_node: 1,
      min_edge: 1
    };
  },
  mounted() {
    this.updateTimelineSettings();
    this.renderGraph();
  },
  methods: {
    updateTimelineSettings() {
      for (let settings of Object.values(this.timelineSettings)) {
        settings.visible = false;
      }
      for (let timeline of this.timelines) {
        if (!(timeline.id in this.timelineSettings)) {
          Vue.set(this.timelineSettings, timeline.id, {
            active: false,
            threshold: 0.5,
            name: timeline.name,
            // visible needed as timelines are briefly deleted and then reinserted
            // when updating the store and we want to persist the setting
            visible: true,
            color: '#ae1313'
          });
        } else {
          this.timelineSettings[timeline.id].visible = true;
        }
      }
    },
    renderGraph() {
      const options = {
        nodes: {
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
      return data.y.filter(v => v >= threshold).reduce((v1) => v1 + 1, 0);
    },
    getConstellations() {
      const active_timelines = this.timelines.filter((t) => this.timelineSettings[t.id].active && this.timelineSettings[t.id].visible);
      const nodes = new DataSet(
        active_timelines.map((t) => {
          const count = this.countAppearance(t.plugin.data, this.timelineSettings[t.id].threshold);
          return {
            id: t.id,
            label: t.name + ': ' + count,
            value: count,
            color: {
              background: '#ffffff',
              border: this.timelineSettings[t.id].color,
              highlight: this.timelineSettings[t.id].color
            }
          };
        }).filter((t) => t.value > this.min_node)
      );

      // build all combinations of two timelines
      const node_combinations = active_timelines.flatMap((v, i) =>
        active_timelines.slice(i + 1).map((w) => [v, w])
      );
      const edges = new DataSet(
        node_combinations.map((c) => {
          const overlap = this.calcTimelineOverlap(
            c[0].plugin.data,
            c[1].plugin.data,
            Math.min(this.timelineSettings[c[0].id].threshold, this.timelineSettings[c[1].id].threshold),
          )
          return {
            from: c[0].id,
            to: c[1].id,
            id: c[0].id + c[1].id,
            label: String(overlap),
            value: overlap,
            color: {
              color: this.blendColors(this.timelineSettings[c[0].id].color, this.timelineSettings[c[1].id].color)
            }
          };
        }).filter((nc) => nc.value > this.min_edge)
      );

      return { nodes: nodes, edges: edges };
    },
    debounced_graph_loading() {
      this.loading = true;
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(this.renderGraph, 3000);
    },
    blendColors(colorA, colorB) {
      const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
      const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
      const r = Math.round(rA + (rB - rA) * 0.5).toString(16).padStart(2, '0');
      const g = Math.round(gA + (gB - gA) * 0.5).toString(16).padStart(2, '0');
      const b = Math.round(bA + (bB - bA) * 0.5).toString(16).padStart(2, '0');
      return '#' + r + g + b;
    }
  },
  computed: {
    timelines() {
      return this.timelineStore
        .all
        .filter((timeline) => timeline.type === "PLUGIN_RESULT" && timeline.plugin.type === 'SCALAR');
    },
    visibleTimelines() {
      return Object.values(this.timelineSettings).filter((t) => t.visible);
    },
    ...mapStores(useTimelineStore),
  },
  watch: {
    timelines() {
      this.updateTimelineSettings();
    },
    'timelineSettings': {
      handler: function () {
        this.debounced_graph_loading();
      },
      deep: true
    },
    min_edge() {
      this.debounced_graph_loading();
    },
    min_node() {
      this.debounced_graph_loading();
    }
  },
};
</script>