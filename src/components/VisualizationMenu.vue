<template>
    <v-card width="100%">
        <v-btn @click='toggleCollapse' style="color: rgb(175, 20, 20); background-color: #E6E6E6" class="m-1" elevation="2">
        <v-icon v-if="!collapsed" color="primary">mdi-arrow-up-drop-circle-outline</v-icon>
        <v-icon v-if="collapsed" color="primary">mdi-arrow-down-drop-circle-outline</v-icon>
        &nbsp;{{ $t('visualization.title') }}&nbsp; 
        <v-icon v-if="!collapsed" color="primary">mdi-arrow-up-drop-circle-outline</v-icon>
        <v-icon v-if="collapsed" color="primary">mdi-arrow-down-drop-circle-outline</v-icon>
        </v-btn>
        <v-card v-if="!collapsed"
              class="ma-2"
              width="100%"
              elevation="2"
              scrollable="False">
            <v-card-text>
              <v-tabs
              horizontal class="tabs-left" v-model="chosenChart">
                <v-tab>
                  <v-icon left>
                      mdi-chart-scatter-plot
                  </v-icon>
                  <span class="text-button">{{ $t("visualization.controls.plotTypes.scatterPlot") }}</span>
                </v-tab>
                <v-tab>
                  <v-icon left>
                      mdi-chart-line
                  </v-icon>
                  <span class="text-button">{{ $t("visualization.controls.plotTypes.linePlot") }}</span>
                </v-tab>
                 <v-tab-item>
                  <div ref='scatterPlotContainer' id='scatterPlotContainer'></div>
                </v-tab-item>
                <v-tab-item>
                  <div ref='linePlotContainer' id='linePlotContainer'></div>
                </v-tab-item>
               </v-tabs>
            </v-card-text>
        </v-card>
    </v-card>
</template>

<script>
import { mapStores } from "pinia";
import { usePluginRunResultStore } from "@/store/plugin_run_result";
import { useTimelineStore } from "@/store/timeline";
import { usePlayerStore } from "@/store/player";
import * as Plotly from 'plotly.js';

const CHART_PLOT_MAPPING = {
     0: "SCALAR",
     1: "SCALAR",
 };

 const CHART_ID_MAPPING = {
     0: "scatterPlotContainer",
     1: "linePlotContainer",
 }

export default {
    data() {
        return {
            collapsed: true,
            plotData: null,
            chosenChart: 0,
            plotLayout: null,
            margin: { autoexpand: false },
            autosize: false,
        };
    },
    methods: {
        async loadData(chosenChart) {
            return new Promise((resolve) => {
                this.plotData = [];

                this.timelineStore.all
                    .filter((timeline) => timeline.type === "PLUGIN_RESULT")
                    .map((timeline) => {
                        const result = this.pluginRunResultStore.get(timeline.plugin_run_result_id);

                        if (result) {
                            if (result.type == CHART_PLOT_MAPPING[chosenChart]) {
                                this.plotData.push(this.dataMapper(result, timeline, chosenChart));
                            }
                        }
                    })
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
                    title: 'Scatter Plot',
                    xaxis: { title: 'Time (Minutes)'},
                    yaxis: { title: 'Value' },
                    showlegend: true,
                    hovermode: 'x',
                    value: 'closest',
                };
            }
            if (plotNumber === 1) {
                return {
                    title: 'Line Plot',
                    xaxis: { title: 'Time (Minutes)'},
                    yaxis: { title: 'Value' },
                    showlegend: true,
                    hovermode: 'x',
                    value: 'closest',
                };
            }
            if (plotNumber === 2) {
                return {
                    title: "Histogram Plot",
                    xaxis: { title: "Categories" },
                    yaxis: { title: 'Value' },
                    showlegend: true,
                    hovermode: 'x',
                    value: 'closest',
                };
            }
        },
        dataMapper(result, timeline, plotNumber) {
            if (plotNumber === 0) {
                return {
                    x: result.data.time,
                    y: result.data.y,
                    type: 'scatter',
                    name: timeline.name,
                    visible: "legendonly",
                    mode: "markers",
                };
            }
            if (plotNumber === 1) {
                return {
                    x: result.data.time,
                    y: result.data.y,
                    type: 'scatter',
                    name: timeline.name,
                    visible: "legendonly",
                    mode: "lines",
                };
            }
        },
        drawMarker(xValue, convert) {
            var xCoordinate = xValue;

            if (convert){
                // for some reason, plotly extends the range of the axis by a factor of ~1.06
                // to get the original, data-depended length, I have to multiply the axis-range by this magic number of 0.944138 here
                // Apparently, this is only the case for the scatter plot so far, thus the following if-else
                // TODO: If you find out, how to make plotly use the data ranges properly, you can remove this. I was not able to.
                if (this.chosenChart === 0){
                    xCoordinate = (this.plotLayout.xaxis.range[1] * 0.944138 ) * xValue / this.duration;
                }else{
                    xCoordinate = (this.plotLayout.xaxis.range[1]) * xValue / this.duration;
                }
            }

            const shape = {
                type: 'line',
                x0: xCoordinate,
                x1: xCoordinate,
                y0: this.plotLayout.yaxis.range[0],
                y1: this.plotLayout.yaxis.range[1],
                line: { color: "rgb(175, 20, 20)", width: 2, },
            };

            Plotly.relayout(this.choosePlotContainer(this.chosenChart), { shapes: [shape] });
        },
        renderPlot(chosenPlot) {
            this.plotLayout = this.getPlotLayout(chosenPlot);
            Plotly.newPlot(CHART_ID_MAPPING[chosenPlot], this.plotData, this.plotLayout);
            // Add a vertical line shape at the x position of the mouse cursor
            document.getElementById(CHART_ID_MAPPING[chosenPlot]).on('plotly_click', (eventData) => {
                const xCoordinate = eventData.points[0].x;
                // notify parent Container of timechange for the video player, drawMarker will be called due to the time update
                this.playerStore.setTargetTime(xCoordinate);
            });
        },
        toggleCollapse() {
            this.collapsed = !this.collapsed;
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
        ...mapStores(usePluginRunResultStore, useTimelineStore, usePlayerStore)
    },
    watch: {
        currentTime(time){
            this.drawMarker(time, true);
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
    }
}
</script>
