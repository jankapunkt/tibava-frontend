<template>
  <v-main class="main" @keydown.native="onKeyDown" tabindex="0" ref="main">
    <v-container fluid>
      <v-row class="ma-2">
        <v-col cols="6">
          <v-card
            class="d-flex flex-column flex-nowrap px-2"
            elevation="2"
            v-resize="onVideoResize"
            ref="videoCard"
          >
            <v-row>
              <v-card-title>
                {{ playerStore.videoName }}
              </v-card-title>
            </v-row>

            <v-row class="flex-grow-1">
              <v-col>
                <VideoPlayer @resize="onVideoResize" />
              </v-col>
            </v-row>
            <v-row class="mb-2 px-4">
              <TimeSelector width="100%" @resize="onVideoResize" />
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="6">
          <v-card
            elevation="2"
            ref="resultCard"
            :height="resultCardHeight"
          >
            <div class="sticky-tabs-bar">
              <v-tabs v-model="tab" centered>
                <v-tabs-slider />
                <v-tab>Shots</v-tab>
                <v-tab>Annotations</v-tab>
                <v-tab>Transcript</v-tab>
                <v-tab>Word Cloud</v-tab>
                <!-- <v-tab>Current Entities</v-tab> -->
                <!-- <v-tab disabled>Persons</v-tab>
                <v-tab disabled>Scenes</v-tab> -->
              </v-tabs>
            </div>
            <v-tabs-items v-model="tab" style="height: 95%">
              <v-tab-item style="height: 100%">
                <ShotsOverview @seek="onTargetTimeChange"/>
              </v-tab-item>
                
              <v-tab-item>
                <CurrentEntitiesOverView/>
              </v-tab-item>
                
              <v-tab-item style="height: 100%">
                <TranscriptOverview @seek="onTargetTimeChange"/>
              </v-tab-item>
              
              <v-tab-item>
                <WordcloudCard />
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="ma-5" max-width="100%" width="100%">
        <v-btn @click='toggleCollapse' style="background-color: #E6E6E6" class="m-1" elevation="5">
          <v-icon color="primary">mdi-chart-box-outline</v-icon>
            {{ $t('visualization.title') }}
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
                  <div id='linePlotContainer'></div>
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
      </v-row>

      <v-row class="ma-2">
        <v-col>
          <v-card
            class="d-flex flex-column flex-nowrap"
            max-width="100%"
            elevation="2"
            scrollable="False"
          >
            <v-card-title> Timelines </v-card-title>
            <v-flex grow class="mb-2 px-4">
              <Timeline ref="timeline" width="100%"> </Timeline>
            </v-flex>
          </v-card>
        </v-col>
      </v-row>
      <ModalTimelineSegmentAnnotate :show.sync="annotationDialog.show" />
    </v-container>
  </v-main>
</template>

<script>
import VideoPlayer from "@/components/VideoPlayer.vue";
import TranscriptOverview from "@/components/TranscriptOverview.vue";
import Timeline from "@/components/Timeline.vue";
import TimeSelector from "@/components/TimeSelector.vue";
import EntitiesCard from "@/components/EntitiesCard.vue";
import CurrentEntitiesOverView from "@/components/CurrentEntitiesOverView.vue";
import ModalTimelineSegmentAnnotate from "@/components/ModalTimelineSegmentAnnotate.vue";
import ShotsOverview from "@/components/ShotsOverview.vue";
import WordcloudCard from "@/components/WordcloudCard.vue";
import VideoVisualization from "../components/VideoVisualization.vue";

import * as Keyboard from "../plugins/keyboard.js";
import * as Plotly from 'plotly.js';
// import store from "../store/index.js";

import { mapStores } from "pinia";
import { useVideoStore } from "@/store/video";
import { usePlayerStore } from "@/store/player";
import { useTimelineStore } from "@/store/timeline";
import { useTimelineSegmentStore } from "@/store/timeline_segment";
import { useTimelineSegmentAnnotationStore } from "@/store/timeline_segment_annotation";
import { useShortcutStore } from "@/store/shortcut";
import { useAnnotationShortcutStore } from "../store/annotation_shortcut.js";
import { usePluginRunStore } from "../store/plugin_run.js";
import { usePluginRunResultStore } from "../store/plugin_run_result.js";

export default {
  data() {
    return {
      //timer
      fetchPluginTimer: null,

      selectedTimelineProxy: null,
      videoTime: 0,
      targetTime: 0,
      startTime: 0,
      endTime: 0,
      tab: null,
      addedAnnotation: null,
      labels: [],
      selectedLabel: null,
      annotationsLUT: {},
      // Visualize! data fields
      collapsed: true,
      plotData: null,
      plotLayout: {
        title: 'Scatter Plot',
        xaxis: { title: 'Time' },
        yaxis: { title: 'Metrics' },
        showlegend: true,
      },
      //
      annotationDialog: {
        show: false,
      },
      // annotations: [],
      // annotationCategories: [],
      resultCardHeight: 69,
    };
  },
  methods: {
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
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed;
    },
    onVideoResize() {
      this.resultCardHeight = this.$refs.videoCard.$el.clientHeight;
    },
    onKeyDown(event) {
      const lastSelectedTimeline = this.timelineStore.lastSelected;
      const lastSelectedTimelineSegment =
        this.timelineSegmentStore.lastSelected;
      if (!lastSelectedTimeline) {
        if (
          event.key == "ArrowDown" ||
          event.key == "ArrowUp" ||
          event.key == "ArrowLeft" ||
          event.key == "ArrowRight"
        ) {
          const selectedTimeline = this.timelineStore.getNext(null);
          this.timelineStore.addToSelection(selectedTimeline.id);
          const timelineSegments = this.timelineSegmentStore.forTimeline(
            selectedTimeline.id
          );
          if (timelineSegments.length > 0) {
            const selectedTimelineSegment = timelineSegments[0];
            this.timelineSegmentStore.addToSelection(
              selectedTimelineSegment.id
            );
          }
          return;
        }
      }

      if (event.key == "ArrowDown") {
        const nextTimeline = this.timelineStore.getNext(
          lastSelectedTimeline.id
        );
        if (!nextTimeline) {
          return;
        }
        // delete old selection
        if (!event.ctrlKey) {
          this.timelineStore.clearSelection();
          this.timelineSegmentStore.clearSelection();
        }

        this.timelineStore.addToSelection(nextTimeline.id);
        const timelineSegments = this.timelineSegmentStore.forTimeline(
          nextTimeline.id
        );
        if (timelineSegments.length > 0) {
          const nextSelectedTimelineSegment = timelineSegments[0];
          this.timelineSegmentStore.addToSelection(
            nextSelectedTimelineSegment.id
          );
        }
        event.preventDefault();
      } else if (event.key == "ArrowUp") {
        const nextTimeline = this.timelineStore.getPrevious(
          lastSelectedTimeline.id
        );
        if (!nextTimeline) {
          return;
        }
        // delete old selection
        if (!event.ctrlKey) {
          this.timelineStore.clearSelection();
          this.timelineSegmentStore.clearSelection();
        }

        this.timelineStore.addToSelection(nextTimeline.id);
        const timelineSegments = this.timelineSegmentStore.forTimeline(
          nextTimeline.id
        );
        if (timelineSegments.length > 0) {
          const nextSelectedTimelineSegment = timelineSegments[0];
          this.timelineSegmentStore.addToSelection(
            nextSelectedTimelineSegment.id
          );
        }
        event.preventDefault();
      } else if (event.key == "ArrowLeft") {
        if (!lastSelectedTimelineSegment) {
          return;
        }
        const nextTimelineSegment =
          this.timelineSegmentStore.getPreviousOnTimeline(
            lastSelectedTimelineSegment.id
          );
        if (!nextTimelineSegment) {
          return;
        }
        if (!event.ctrlKey) {
          this.timelineSegmentStore.clearSelection();
        }
        this.timelineSegmentStore.addToSelection(nextTimelineSegment.id);
        event.preventDefault();
      } else if (event.key == "ArrowRight") {
        if (!lastSelectedTimelineSegment) {
          return;
        }
        const nextTimelineSegment = this.timelineSegmentStore.getNextOnTimeline(
          lastSelectedTimelineSegment.id
        );
        if (!nextTimelineSegment) {
          return;
        }
        if (!event.ctrlKey) {
          this.timelineSegmentStore.clearSelection();
        }
        this.timelineSegmentStore.addToSelection(nextTimelineSegment.id);
        event.preventDefault();
      } else if (event.key == "Enter") {
        this.onAnnotateSegment();
        event.preventDefault();
      }

      // handling shortcut
      const keys = [];
      if (event.ctrlKey) {
        keys.push("ctrl");
      }
      if (event.shiftKey) {
        keys.push("shift");
      }
      if (event.key.length === 1) {
        keys.push(event.key.toLowerCase());
      }

      const keysString = Keyboard.generateKeysString(keys);
      const shortcuts = this.shortcutStore.getByKeys(keysString);

      if (shortcuts.length > 0) {
        shortcuts.forEach((shortcut) => {
          const annotationShortcut = this.annotationShortcutStore.forShortcut(
            shortcut.id
          );

          if (annotationShortcut) {
            if (lastSelectedTimelineSegment) {
              this.timelineSegmentStore.toggle({
                timelineSegmentId: lastSelectedTimelineSegment.id,
                annotationId: annotationShortcut.annotation_id,
              });
            }
          }
        });
      }
    },
    onTargetTimeChange(time) {
      this.targetTime = time;
    },
    onAnnotateSegment() {
      if (this.timelineSegmentStore.lastSelected) {
        this.$nextTick(() => {
          this.annotationDialog.show = true;
        });
      }
    },
    async fetchData({ addResults = true }) {
      // Ask backend about all videos+

      await this.videoStore.fetch({
        videoId: this.$route.params.id,
        addResults: addResults,
      });
    },
    async fetchPlugin() {

      let updateState = await this.pluginRunStore.fetchForVideo({
        videoId: this.$route.params.id,
        fetchResults: true,
      });
    },
  },
  computed: {
    shouldLoadData() {
      return !this.collapsed && !this.plotData;
    },
    pluginInProgress() {
      return this.pluginRunStore.pluginInProgress;
    },
    duration() {
      let duration = this.playerStore.videoDuration;
      return duration;
    },
    timelines() {
      return this.timelineStore.forVideo(this.$route.params.id);
    },
    timelineNames() {
      return this.timelines.map((e) => e.name);
    },
    selectedTimeline: {
      get() {
        return this.selectedTimelineProxy === null
          ? this.timelines[0]
          : this.selectedTimelineProxy;
      },
      set(val) {
        this.selectedTimelineProxy = val;
      },
    },

    ...mapStores(
      useVideoStore,
      usePluginRunStore,
      usePlayerStore,
      useTimelineStore,
      useTimelineSegmentStore,
      useTimelineSegmentAnnotationStore,
      useShortcutStore,
      useAnnotationShortcutStore,
      usePluginRunResultStore,
    ),
  },
  async created() {
    // fetch the data when the view is created and the data is
    // already being observed

    this.fetchData({ addResults: true });

    this.fetchTimer = setInterval(
      function () {
        // this.fetchData({ addResults: false });
      }.bind(this),
      5000
    );
  },
  mounted() {
    this.resultCardHeight = this.$refs.videoCard.$el.clientHeight;
    this.$refs.main.$el.focus();
    // document.addEventListener("keydown", (e) => {

    // });
  },

  components: {
    VideoPlayer,
    TranscriptOverview,
    Timeline,
    TimeSelector,
    EntitiesCard,
    CurrentEntitiesOverView,
    ModalTimelineSegmentAnnotate,
    ShotsOverview,
    WordcloudCard,
    VideoVisualization
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
    pluginInProgress(newState, oldState) {
      if (newState) {
        this.fetchPluginTimer = setInterval(
          function () {
            this.fetchPlugin({ addResults: false });
          }.bind(this),
          1000
        );
      }
      if (!newState) {
        clearInterval(this.fetchPluginTimer);
      }
    },
  },

  beforeRouteLeave(to, from, next) {
    clearInterval(this.fetchPluginTimer);
    this.playerStore.clearStore();
    next(true);
  },
};
</script>

<style scoped>
.logo > img {
  max-height: 56px;
}

.sticky-tabs-bar {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white; /* Adjust the background color if needed */
}

.card-title {
  font-size: 64;
}

.timeline-bar {
  height: 80px;
}

.main:focus {
  outline: none;
}
</style>
