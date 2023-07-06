<template>
    <div>
        <v-dialog v-model="menu" min-width="175" max-width="90%" offset-y bottom left>
            <template v-slot:activator="{ attrs, on: menu }">
                <v-btn tile text v-bind="attrs" v-on="menu" class="ml-n2" :title="$t('visualization.title')">
                    <v-icon color="primary">mdi-chart-box-outline</v-icon>
                    {{ $t('visualization.title') }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title class="mb-2">
                    {{ $t("visualization.title") }}
                    <v-btn icon @click="menu = false" absolute right>
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-tabs vertical class="tabs-left" v-model="tab">
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
                            <v-card flat>
                                <v-card-title>
                                    {{ $t("visualization.controls.plotTypes.linePlot") }}
                                </v-card-title>
                                <v-card-text>
                                    <v-form>
                                        <v-menu offset-y>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn class="mt-5" v-bind:dark="plotData !== null"
                                                    v-bind="attrs" v-on="on">
                                                    <span v-if="plotData === null">
                                                        {{ $t("visualization.controls.plotTypes.resultControlName") }}
                                                    </span>
                                                    <span v-else>
                                                        {{ plotData.timeline.name }}
                                                    </span>
                                                </v-btn>
                                            </template>
                                            <v-list>
                                                <v-list-item v-for="target in visualizationTargets" link
                                                    @click="selectVisualizationTarget(target)">
                                                    <v-list-item-title v-text="target.timeline.name"></v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                        <br />
                                        <div v-if="plotData !== null">
                                            <div class="text-h5 mt-5">
                                                {{ $t("visualization.controls.mapping.mappingTitle") }}
                                            </div>
                                            <div class="text-h6">
                                                {{ $t("visualization.controls.mapping.xTitle") }}
                                            </div>
                                            <v-menu offset-y>
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-btn class="mt-5"
                                                        v-bind:dark="xMapping !== null"
                                                        v-bind="attrs" v-on="on">
                                                        <span v-if="xMapping !== null">
                                                            {{ xMapping }}
                                                        </span>
                                                        <span v-else>
                                                            {{ $t("visualization.controls.mapping.xSelect") }}
                                                        </span>
                                                    </v-btn>
                                                </template>
                                                <v-list>
                                                    <v-list-item v-for="target in possibleMappings.x" key="target" link
                                                        @click="selectMappingTarget('xMapping', target)">
                                                        <v-list-item-title v-text="target"></v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                            <div class="text-h6 mt-5">
                                                {{ $t("visualization.controls.mapping.yTitle") }}
                                            </div>
                                            <v-menu offset-y>
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-btn class="mt-5"
                                                        v-bind:dark="yMapping !== null"
                                                        v-bind="attrs" v-on="on">
                                                        <span v-if="yMapping !== null">
                                                            {{ yMapping }}
                                                        </span>
                                                        <span v-else>
                                                            {{ $t("visualization.controls.mapping.ySelect") }}
                                                        </span>
                                                    </v-btn>
                                                </template>
                                                <v-list>
                                                    <v-list-item v-for="target in possibleMappings.y" key="target" link
                                                        @click="selectMappingTarget('yMapping', target)">
                                                        <v-list-item-title v-text="target"></v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                        </div>
                                    </v-form>
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card flat>
                                <v-card-title>
                                    {{ $t("visualization.controls.plotTypes.histogramChart") }}
                                </v-card-title>
                                <v-card-text>
                                    Params here
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card flat>
                                <v-card-title>
                                    {{ $t("visualization.controls.plotTypes.stackedBarChart") }}
                                </v-card-title>
                                <v-card-text>
                                    Params here
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                    </v-tabs>
                </v-card-text>
                <v-card-actions class="pt-0">
                    <v-btn @click="visualize" v-bind:disabled="!isSetupValid">{{ $t("visualization.start") }}</v-btn>
                    <v-btn @click="reset">{{ $t("visualization.reset") }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { mapStores } from "pinia";
import { usePluginRunResultStore } from "@/store/plugin_run_result";
import { useTimelineStore } from "@/store/timeline";

const plotTypeResultMapping = {
    "linePlot": ["SCALAR"],
    "histogramChart": ["HIST"],
    "stackedBarChart": ["RGB_HIST"]
};

const plotTypePossibleMappings = {
    "SCALAR": {
        "x": ["time"],
        "y": ["y"]
    }
};

export default {
    data() {
        return {
            menu: false,
            tab: null,
            plotTypes: Object.keys(plotTypeResultMapping),
            possibleMappings: null,
            chosenPlot: "",
            plotData: null,
            xMapping: null,
            yMapping: null
        };
    },
    methods: {
        resetVisualizationParams() {
            this.plotType = "";
            this.resetPlotData()
            this.resetMappings();
            this.timelineStore.setVisualizationData(null);
        },
        resetMappings() {
            this.xMapping = null;
            this.yMapping = null;
        },
        resetPlotData() {
            this.plotData = null;
        },
        visualize() {
            this.timelineStore.setVisualizationData({
                "plotData": this.plotData,
                "chosenPlot": this.chosenPlot,
                "xMapping": this.xMapping,
                "yMapping": this.yMapping
            });
            this.menu = false;
        },
        reset() {
            this.resetVisualizationParams();
        },
        selectVisualizationTarget(target) {
            this.possibleMappings = plotTypePossibleMappings[target["result"]["type"]];
            if (target === this.plotData) {
                this.resetMappings();
                this.resetPlotData();
                return;
            }
            this.plotData = target;
        },
        selectResult(targetData) {
            this.plotData = targetData;
        },
        selectMappingTarget(source, target) {
            if (this[source] === target) {
                this[source] = null;
                return;
            }
            this[source] = target;
        }
    },
    computed: {
        visualizationTargets() {
            let appropriateTargets = [];
            if (this.chosenPlot === "") {
                return appropriateTargets;
            }
            let tempResult = null;
            const pluginResults = this.pluginRunResultStore.all;
            const timelines = this.timelineStore.all;
            for (let timeline of timelines) {
                if (!("plugin_run_result_id" in timeline) || !pluginResults.includes(timeline["plugin_run_result_id"])) {
                    continue;
                }
                tempResult = this.pluginRunResultStore.get(timeline["plugin_run_result_id"]);
                if (plotTypeResultMapping[this.chosenPlot].includes(tempResult.type)) {
                    appropriateTargets.push({ "timeline": timeline, "result": tempResult });
                }
            }
            return appropriateTargets;
        },
        isSetupValid() {
            if (this.chosenPlot === "") {
                return false;
            }
            if (this.plotData === null) {
                return false;
            }
            if (this.xMapping === null ||
                this.yMapping === null) {
                return false;
            }
            return true;
        },
        ...mapStores(usePluginRunResultStore, useTimelineStore)
    },
    watch: {
        tab(newTab) {
            this.chosenPlot = this.plotTypes[newTab];
        }
    }
}
</script>
