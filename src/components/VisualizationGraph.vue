<template>
  <div ref="plotContainer" :id="plotContainerId" style="height: 400px; width: calc(100vw - 120px);"></div>
</template>

<script>
import { mapStores } from "pinia";
import { usePluginRunResultStore } from "@/store/plugin_run_result";
import { useTimelineStore } from "@/store/timeline";
import { usePlayerStore } from "@/store/player";
import * as Plotly from "plotly.js";


export default {
  data() {
    return {
      plotContainerId: "plotContainer" + this.plotType,
    };
  },
  props: ['plotType'],
  mounted() {
    this.renderPlot();
  },
  methods: {
    drawMarker(xValue) {
      if (!this.plotData) {
        return;
      }

      const shape = {
        type: "line",
        x0: xValue,
        x1: xValue,
        y1: this.minMaxY.max * 1.1,
        y0: this.minMaxY.min,
        line: { color: "rgb(175, 20, 20)", width: 2 },
      };

      Plotly.relayout(this.$refs.plotContainer, { shapes: [shape] });
    },
    renderPlot() {
      Plotly.newPlot(
        this.plotContainerId,
        this.plotData,
        {
          xaxis: { title: "Time (Seconds)" },
          yaxis: { title: "Value" },
          showlegend: true,
          hovermode: "x",
          value: "closest",
        },
        { responsive: true }
      );
      // Add a vertical line shape at the x position of the mouse cursor
      document
        .getElementById(this.plotContainerId)
        .on("plotly_click", (eventData) => {
          const xCoordinate = eventData.points[0].x;
          // notify parent Container of timechange for the video player, drawMarker will be called due to the time update
          this.playerStore.setTargetTime(xCoordinate);
        });
      this.drawMarker(this.currentTime);
    },
  },
  computed: {
    plotData() {
      return this.timelineStore.all
        .filter((timeline) => timeline.type === "PLUGIN_RESULT")
        .map((timeline) => ({ timeline: timeline, result: this.pluginRunResultStore.get(timeline.plugin_run_result_id) }))
        .filter((tr) => tr.result && tr.result.type == "SCALAR")
        .map((tr) => ({
          x: tr.result.data.time,
          y: tr.result.data.y,
          type: "scatter",
          name: tr.timeline.name,
          visible: "legendonly",
          mode: this.lineMode,
        }));
    },
    minMaxY() {
      // used to draw the time marker with the correct height
      let max = 0;
      let min = -0.1;
      for (let data of this.plotData) {
        for (let y of data.y) {
          if (max < y) {
            max = y;
          }
          if (min > y) {
            min = y;
          }
        }
      }
      return { max: max, min: min };
    },
    duration() {
      return this.playerStore.videoDuration;
    },
    currentTime() {
      return this.playerStore.currentTime;
    },
    lineMode() {
      if (this.plotType === 'scatter') {
        return 'markers';
      } else {
        return 'lines';
      }
    },
    ...mapStores(usePluginRunResultStore, useTimelineStore, usePlayerStore),
  },
  watch: {
    currentTime(time) {
      this.drawMarker(time);
    },
    plotData() {
      this.renderPlot();
    }
  },
};
</script>
