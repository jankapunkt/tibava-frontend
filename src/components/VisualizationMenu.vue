<template>
    <div>
        <v-dialog @input="handleDialogInput" v-model="dialogVisible" min-width="175" max-width="90%" offset-y bottom left persistent>
            <template v-slot:activator="{ attrs, on: isDialogVisible }">
                <v-btn tile text v-bind="attrs" v-on="isDialogVisible" class="ml-n2" :title="$t('visualization.title')">
                    <v-icon color="primary">mdi-chart-box-outline</v-icon>
                    {{ $t('visualization.title') }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title class="mb-2">
                    {{ $t("visualization.title") }}
                    <v-btn icon @click="isDialogVisible = false" absolute right>
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
                                <div id='plotContainer'></div>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card flat>
                                <v-card-text>
                                    Params here
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card flat>
                                <v-card-text>
                                    Params here
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                    </v-tabs>
                </v-card-text>
                <!-- <v-card-actions class="pt-0">
                    <v-btn @click="visualize" v-bind:disabled="!isSetupValid">{{ $t("visualization.start") }}</v-btn>
                    <v-btn @click="reset">{{ $t("visualization.reset") }}</v-btn>
                </v-card-actions> -->
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
    mounted() {
        console.log("mounted");
    },
    updated() {
        console.log("updated");
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
    loadData() {
        // TODO: find a better way than this timeout to render the plot after the container has been created
        setTimeout(() => {
            // Replace this with your actual data loading logic
            var a = {
                x: [1, 2, 3, 4, 5],
                y: [1, 4, 9, 16, 25],
                type: 'scatter',
                name: 'Name 1'
            };
            var b = {
                x: [2, 4, 6, 8, 15],
                y: [121, 24, 69, 6, 15],
                type: 'scatter',
                name: 'Name 2'
            };
            
            this.plotData = [a, b];

            // Render the Plotly Lineplot
            Plotly.newPlot('plotContainer', this.plotData);
        }, 1);
    },
    },
    computed: {
        shouldLoadData() {
            return this.dialogVisible && !this.plotData;
        },
        ...mapStores(usePluginRunResultStore, useTimelineStore)
    },
    watch: {
        shouldLoadData() {
            if (this.shouldLoadData) {
                this.loadData();
            }
        },
    }
}
</script>
