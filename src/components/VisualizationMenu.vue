<template>
    <div>
        <v-dialog @input="handleDialogInput" v-model="dialogVisible" min-width="175" max-width="90%" offset-y bottom left persistent>
            <template v-slot:activator="{ attrs, on: dialogVisible }">
                <v-btn tile text v-bind="attrs" v-on="dialogVisible" class="ml-n2" :title="$t('visualization.title')">
                    <v-icon color="primary">mdi-chart-box-outline</v-icon>
                    {{ $t('visualization.title') }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title class="mb-2">
                    {{ $t("visualization.title") }}
                    <v-btn icon @click="dialogVisible = false" absolute right>
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-tabs vertical class="tabs-left">
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
                            <v-card  v-if="dialogVisible">
                                <div id='linePlotContainer'></div>
                            </v-card>
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
        </v-dialog>
    </div>
</template>

<script>
import { mapStores } from "pinia";
import { usePluginRunResultStore } from "@/store/plugin_run_result";
import { useTimelineStore } from "@/store/timeline";
import * as Plotly from 'plotly.js';

export default {
    data() {
        return {
            dialogVisible: false,
            plotData: null,
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
                                    name: timeline.name
                                };
                                this.plotData.push(data);
                            }
                        }
                    })
                resolve();
            });
        },
        renderPlot() {
            Plotly.newPlot('linePlotContainer', this.plotData);
        }
    },
    computed: {
        shouldLoadData() {
            return this.dialogVisible && !this.plotData;
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
        dialogVisible(value) {
            if (!value) {
                this.$emit("close");
                this.plotData = null;
            } 
        },
    }
}
</script>
