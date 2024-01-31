<template>
  <v-expansion-panels>
    <v-expansion-panel @change="change">
      <v-expansion-panel-header>
        {{ $t("visualization.title") }}
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-tabs horizontal class="tabs-left" v-model="chosenChart">
          <v-tab>
            <v-icon left> mdi-chart-scatter-plot </v-icon>
            <span class="text-button">
              {{ $t("visualization.controls.plotTypes.scatterPlot") }}
            </span>
          </v-tab>
          <v-tab>
            <v-icon left> mdi-chart-line </v-icon>
            <span class="text-button">
              {{ $t("visualization.controls.plotTypes.linePlot") }}
            </span>
          </v-tab>
          <v-tab-item>
            <div ref="scatterPlotContainer" id="scatterPlotContainer" style="height: 400px; width: calc(100vw - 120px);"></div>
          </v-tab-item>
          <v-tab-item>
            <div ref="linePlotContainer" id="linePlotContainer" style="height: 400px; width: calc(100vw - 120px);"></div>
          </v-tab-item>
        </v-tabs>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { mapStores } from "pinia";
import { usePluginRunResultStore } from "@/store/plugin_run_result";
import { useTimelineStore } from "@/store/timeline";
import { usePlayerStore } from "@/store/player";
import * as Plotly from "plotly.js";

const CHART_PLOT_MAPPING = {
  0: "SCALAR",
  1: "SCALAR",
};

const CHART_ID_MAPPING = {
  0: "scatterPlotContainer",
  1: "linePlotContainer",
};

export default {
  data() {
    return {
      collapsed: true,
      plotData: null,
      chosenChart: 0,
      plotLayout: null,
      margin: { autoexpand: false },
      autosize: false,
      magicNumber: 1,
    };
  },
  methods: {
    change(args) {
      this.collapsed = !this.collapsed;
    },
    async loadData(chosenChart) {
      return new Promise((resolve) => {
        this.plotData = [];

        this.timelineStore.all
          .filter((timeline) => timeline.type === "PLUGIN_RESULT")
          .map((timeline) => {
            const result = this.pluginRunResultStore.get(timeline.plugin_run_result_id);

            if (result) {
              if (result.type == CHART_PLOT_MAPPING[chosenChart]) {
                this.plotData.push(
                  this.dataMapper(result, timeline, chosenChart)
                );
              }
            }
          });
        resolve();
      });
    },
    choosePlotContainer(plotNumber) {
      switch (plotNumber) {
        case 0:
          return this.$refs.scatterPlotContainer;
        case 1:
          return this.$refs.linePlotContainer;
      }
    },
    getPlotLayout(plotNumber) {
      if (plotNumber === 0) {
        return {
          title: "Scatter Plot",
          xaxis: { title: "Time (Seconds)" },
          yaxis: { title: "Value" },
          showlegend: true,
          hovermode: "x",
          value: "closest",
        };
      }
      if (plotNumber === 1) {
        return {
          title: "Line Plot",
          xaxis: { title: "Time (Seconds)" },
          yaxis: { title: "Value" },
          showlegend: true,
          hovermode: "x",
          value: "closest",
        };
      }
      if (plotNumber === 2) {
        return {
          title: "Histogram Plot",
          xaxis: { title: "Categories" },
          yaxis: { title: "Value" },
          showlegend: true,
          hovermode: "x",
          value: "closest",
        };
      }
    },
    dataMapper(result, timeline, plotNumber) {
      if (plotNumber === 0) {
        return {
          x: result.data.time,
          y: result.data.y,
          type: "scatter",
          name: timeline.name,
          visible: "legendonly",
          mode: "markers",
        };
      }
      if (plotNumber === 1) {
        return {
          x: result.data.time,
          y: result.data.y,
          type: "scatter",
          name: timeline.name,
          visible: "legendonly",
          mode: "lines",
        };
      }
    },
    drawMarker(xValue) {
      if (!this.plotData) {
        return;
      }

      const shape = {
        type: "line",
        x0: xValue,
        x1: xValue,
        y0: this.plotLayout.yaxis.range[0],
        y1: this.plotLayout.yaxis.range[1],
        line: { color: "rgb(175, 20, 20)", width: 2 },
      };

      Plotly.relayout(this.choosePlotContainer(this.chosenChart), { shapes: [shape] });
    },
    renderPlot(chosenPlot) {
      this.plotLayout = this.getPlotLayout(chosenPlot);
      Plotly.newPlot(
        CHART_ID_MAPPING[chosenPlot],
        this.plotData,
        this.plotLayout,
        { responsive: true }
      );
      // Add a vertical line shape at the x position of the mouse cursor
      document
        .getElementById(CHART_ID_MAPPING[chosenPlot])
        .on("plotly_click", (eventData) => {
          const xCoordinate = eventData.points[0].x;
          // notify parent Container of timechange for the video player, drawMarker will be called due to the time update
          this.playerStore.setTargetTime(xCoordinate);
        });
    },
  },
  computed: {
    shouldLoadData() {
      return [!this.collapsed, this.chosenChart];
    },
    duration() {
      return this.playerStore.videoDuration;
    },
    currentTime() {
      return this.playerStore.currentTime;
    },
    ...mapStores(usePluginRunResultStore, useTimelineStore, usePlayerStore),
  },
  watch: {
    currentTime(time) {
      this.drawMarker(time);
    },
    async shouldLoadData(newValue) {
      if (newValue[0]) {
        await this.loadData(newValue[1]);
        this.renderPlot(newValue[1]);
      }
    },
    collapsed(value) {
      if (value) {
        this.$emit("close");
        this.plotData = null;
      }
    },
  },
};
</script>
