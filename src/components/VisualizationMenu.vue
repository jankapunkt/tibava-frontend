<template>
    <v-card width="100%">
        <v-btn @click='toggleCollapse' style="background-color: #E6E6E6" class="m-1" elevation="5">
          <v-icon color="primary">mdi-chart-box-outline</v-icon> {{ $t('visualization.title') }}
        </v-btn>
        <v-card v-if="!collapsed" 
              class="ma-2"
              width="100%"
              elevation="2"
              scrollable="False">
            <v-card-text>
              <v-tabs 
              horizontal class="tabs-left">
                <v-tab>
                  <v-icon left>
                      mdi-chart-line
                  </v-icon>
                  <span class="text-button">{{ $t("visualization.controls.plotTypes.linePlot") }}</span>
                </v-tab>
                <v-tab>
                  <v-icon left>
                      mdi-chart-histogram
                  </v-icon>
                  <span class="text-button">{{ $t("visualization.controls.plotTypes.histogramChart") }}</span>
                </v-tab>
                <v-tab>
                  <v-icon left>
                      mdi-chart-bar-stacked
                  </v-icon>
                  <span class="text-button">{{ $t("visualization.controls.plotTypes.stackedBarChart") }}</span>
                </v-tab>
                <v-tab-item>
                  <div ref='linePlotContainer' id='linePlotContainer'></div>
                </v-tab-item>
                <v-tab-item>
                  <v-card flat>
                      <v-card-text>
                          TODO
                      </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card flat>
                      <v-card-text>
                          TODO
                      </v-card-text>
                  </v-card>
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
import * as Plotly from 'plotly.js';

export default {
    data() {
        return {
            collapsed: true,
            plotData: null,
            plotLayout: {
                title: 'Scatter Plot',
                xaxis: { title: 'Time' },
                yaxis: { title: 'Value' },
                showlegend: true,
                hovermode: 'x',
                value: 'closest'
            },
        };
    },
    methods: {
        handleDialogInput(value) {
            if (value) {
                this.dialogVisible = true;
            } else {
                // Reset the plot data when the dialog is closed
                this.plotData = null;
                this.dialogVisible = false;
            }
        },
        async loadData() {
            return new Promise((resolve) => {
                this.plotData = [];

                this.timelineStore.all
                    .filter((timeline) => timeline.type === "PLUGIN_RESULT")
                    .map((timeline) => {
                        const result = this.pluginRunResultStore.get(timeline.plugin_run_result_id);
                    
                        if (result) {
                            if (result.type == "SCALAR") {
                                var data = {
                                    x: result.data.y.length,
                                    y: result.data.y,
                                    type: 'scatter',
                                    name: timeline.name,
                                    visible: "legendonly",
                                    mode: "markers",
                                };
                                this.plotData.push(data);
                            }
                        }
                    })
                resolve();
            });
            },
        renderPlot() {
            Plotly.newPlot('linePlotContainer', this.plotData, this.plotLayout);
            // Add a vertical line shape at the x position of the mouse cursor
            var myPlot = document.getElementById('linePlotContainer').on('plotly_hover', (eventData) => {
                const xValue = eventData.points[0].x;
                const shape = {
                    type: 'line',
                    x0: xValue,
                    x1: xValue,
                    y0: this.plotLayout.yaxis.range[0],
                    y1: this.plotLayout.yaxis.range[1],
                    line: {
                        color: 'red',
                        width: 2,
                    },
                };

                Plotly.relayout(this.$refs.linePlotContainer, { shapes: [shape] });
            });

            // Remove the vertical line shape when not hovering
            this.$refs.linePlotContainer.addEventListener('plotly_unhover', () => {
                Plotly.relayout(this.$refs.linePlotContainer, { shapes: [] });
            });
        },
        toggleCollapse() {
            this.collapsed = !this.collapsed;
        },
    },
    computed: {
        shouldLoadData() {
        return !this.collapsed && !this.plotData;
        },
        ...mapStores(usePluginRunResultStore, useTimelineStore)
    },
    watch: {
        async shouldLoadData() {
            if (this.shouldLoadData) {
                await this.loadData();
                this.renderPlot();
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
