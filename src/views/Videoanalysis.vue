<template>
  <v-main class="main" @keydown.native="onKeyDown" tabindex="0" ref="main">
    <v-container fluid>
      <v-row class="ma-2">
        <v-col cols="6">
          <v-card class="d-flex flex-column flex-nowrap px-2" elevation="2" v-resize="onVideoResize" ref="videoCard">
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
          <v-card class="overflow-auto" elevation="2" ref="resultCard" :height="resultCardHeight">
            <v-tabs centered>
              <v-tabs-slider />
              <v-tab>Shots</v-tab>
              <v-tab>Annotations</v-tab>
              <!-- <v-tab>Current Entities</v-tab> -->
              <v-tab disabled>Persons</v-tab>
              <v-tab disabled>Scenes</v-tab>

              <v-tab-item>
                <ShotCard v-for="item in shots" v-bind:key="item.id" :shot="item" @seek="onTagetTimeChange" />
              </v-tab-item>
              <!-- <v-tab-item>
                <EntitiesCard
                  v-for="item in segmentsAnnotations"
                  v-bind:key="item.id"
                  :segment="item"
                  @seek="onTagetTimeChange"
                />
              </v-tab-item> -->
              <v-tab-item>
                <CurrentEntitiesOverView />
              </v-tab-item>
              <v-tab-item> PERSONS </v-tab-item>
              <v-tab-item> SCENES </v-tab-item>
            </v-tabs>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="ma-2">
        <v-col>
          <v-card class="d-flex flex-column flex-nowrap" max-width="100%" elevation="2" scrollable="False">
            <v-card-title> Timelines </v-card-title>
            <v-flex grow class="mb-2 px-4">
              <Timeline ref="timeline" width="100%">
              </Timeline>
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
import ShotCard from "@/components/ShotCard.vue";
import Timeline from "@/components/Timeline.vue";
import TimeSelector from "@/components/TimeSelector.vue";
import EntitiesCard from "@/components/EntitiesCard.vue";
import CurrentEntitiesOverView from "@/components/CurrentEntitiesOverView.vue";
import ModalTimelineSegmentAnnotate from "@/components/ModalTimelineSegmentAnnotate.vue";

import * as Keyboard from "../plugins/keyboard.js";
// import store from "../store/index.js";

import { mapStores } from "pinia";
import { useVideoStore } from "@/store/video";
import { usePlayerStore } from "@/store/player";
import { useShotStore } from "@/store/shot";
import { useTimelineStore } from "@/store/timeline";
import { useTimelineSegmentStore } from "@/store/timeline_segment";
import { useShortcutStore } from "@/store/shortcut";

export default {
  data() {
    return {
      videoTime: 0,
      targetTime: 0,
      startTime: 0,
      endTime: 0,
      selectedSegment: null,
      addedAnnotation: null,
      labels: [],
      selectedLabel: null,
      annotationsLUT: {},
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
    onVideoResize() {
      this.resultCardHeight = this.$refs.videoCard.$el.clientHeight;
    },
    setCursor(cursor, updateTime = false) {
      const shownDuration = this.endTime - this.startTime;
      const selectedSegment =
        this.timelines[cursor.timeline].segments[cursor.segment];
      let newStartTime = Math.min(this.startTime, selectedSegment.start);
      let newEndTime = Math.max(this.endTime, selectedSegment.end);
      this.$nextTick(() => {
        this.startTime = newStartTime;
        this.endTime = newEndTime;
      });
      if (updateTime) {
        this.videoTime = selectedSegment.start;
        this.targetTime = selectedSegment.start;
      }
      this.cursor = cursor;
    },
    onKeyDown(event) {

      const lastSelectedTimeline = this.timelineStore.lastSelected
      const lastSelectedTimelineSegment = this.timelineSegmentStore.lastSelected
      console.log("Event")
      if (!lastSelectedTimeline) {
        console.log("No selection")
        if (event.key == "ArrowDown" || event.key == "ArrowUp" || event.key == "ArrowLeft" || event.key == "ArrowRight") {
          console.log("Key arrow")
          const selectedTimeline = this.timelineStore.getNext(null)
          this.timelineStore.addToSelection(selectedTimeline.id)
          console.log(selectedTimeline)
          const timelineSegments = this.timelineSegmentStore.forTimeline(selectedTimeline.id)
          if (timelineSegments.length > 0) {
            const selectedTimelineSegment = timelineSegments[0]
            console.log(selectedTimelineSegment)
            this.timelineSegmentStore.addToSelection(selectedTimelineSegment.id)
          }
          return
        }
      }

      if (event.key == "ArrowDown") {
        const nextTimeline = this.timelineStore.getNext(lastSelectedTimeline.id)
        if (!nextTimeline) {
          return;
        }
        // delete old selection
        if (!event.ctrlKey) {
          this.timelineStore.clearSelection()
          this.timelineSegmentStore.clearSelection()
        }

        this.timelineStore.addToSelection(nextTimeline.id)
        const timelineSegments = this.timelineSegmentStore.forTimeline(nextTimeline.id)
        if (timelineSegments.length > 0) {
          const nextSelectedTimelineSegment = timelineSegments[0]
          this.timelineSegmentStore.addToSelection(nextSelectedTimelineSegment.id)
        }
        event.preventDefault();
      } else if (event.key == "ArrowUp") {
        const nextTimeline = this.timelineStore.getPrevious(lastSelectedTimeline.id)
        if (!nextTimeline) {
          return;
        }
        // delete old selection
        if (!event.ctrlKey) {
          this.timelineStore.clearSelection()
          this.timelineSegmentStore.clearSelection()
        }

        this.timelineStore.addToSelection(nextTimeline.id)
        const timelineSegments = this.timelineSegmentStore.forTimeline(nextTimeline.id)
        if (timelineSegments.length > 0) {
          const nextSelectedTimelineSegment = timelineSegments[0]
          this.timelineSegmentStore.addToSelection(nextSelectedTimelineSegment.id)
        }
        event.preventDefault();
      } else if (event.key == "ArrowLeft") {

        const nextTimelineSegment = this.timelineSegmentStore.getPreviousOnTimeline(lastSelectedTimelineSegment.id)
        if (!nextTimelineSegment) {
          return;
        }
        if (!event.ctrlKey) {
          this.timelineSegmentStore.clearSelection()
        }
        this.timelineSegmentStore.addToSelection(nextTimelineSegment.id)
        event.preventDefault();
      } else if (event.key == "ArrowRight") {
        const nextTimelineSegment = this.timelineSegmentStore.getNextOnTimeline(lastSelectedTimelineSegment.id)
        if (!nextTimelineSegment) {
          return;
        }
        if (!event.ctrlKey) {
          this.timelineSegmentStore.clearSelection()
        }
        this.timelineSegmentStore.addToSelection(nextTimelineSegment.id)
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
      if (this.shortcutAnnotationMap[keysString] != null) {
        this.shortcutAnnotationMap[keysString].forEach((annotationId) => {
          this.timelineSegmentAnnotationStore.toggle({
            timelineSegmentId: this.cursor.id,
            annotationId: annotationId,
          });
        });
      }
    },
    onTimeUpdate(time) {
      this.videoTime = time;
    },
    onTagetTimeChange(time) {
      this.targetTime = time;
    },
    onEndTimeChange(time) {
      this.endTime = time;
    },
    onStartTimeChange(time) {
      this.startTime = time;
    },
    onCopyTimeline(id) {
      this.timelineStore.duplicate(id);
    },
    onRenameTimeline(id) {
      this.timelineStore.rename(id);
    },
    onChangeTimelineVisualization(id) {
      this.timelineStore.changevisualization(id);
    },
    onTimelineSetParent(id) {
      console.log(id);
      this.timelineStore.setparent(id);
    },
    onTimelineSetCollapse(id) {
      this.timelineStore.setcollapse(id);
    },
    onTimelineSetOrder(id) {
      this.timelineStore.setorder(id);
    },
    onDeleteTimeline(id) {
      this.timelineStore.delete(id);
    },
    onAnnotateSegment() {
      if (this.timelineSegmentStore.lastSelected) {

        this.$nextTick(() => {
          this.annotationDialog.show = true;
        });
      }
    },
    onAppendAnnotation(evt) {
      evt.preventDefault();
      this.timelineStroe.annotate({
        segment_id: this.cursorSegment,
        annotation: this.addedAnnotation,
      });
      this.labels.push(this.addedAnnotation);
      this.addedAnnotation = null;
      this.annotation_dialog = false;
    },
    submitAnnotation(evt) {
      this.annotation_dialog = false;
    },
    AnnotationInformation(
      id,
      entity_name,
      entity_category,
      color,
      start,
      end,
      timeline
    ) {
      this.id = id;
      this.entity_name = entity_name;
      this.entity_category = entity_category;
      this.color = color;
      this.start = start;
      this.end = end;
      this.timeline = timeline;
    },
    TimeSegments(id, name, start, end, annotations) {
      this.id = id;
      this.name = name;
      this.start = start;
      this.end = end;
      this.annotations = annotations;
    },

    async fetchData({ addResults = true }) {
      // Ask backend about all videos

      await this.videoStore.fetch({ videoId: this.$route.params.id, addResults: addResults });
      this.shotStore.buildShots();
    },
  },
  computed: {
    duration() {
      let duration = this.playerStore.videoDuration;
      return duration;
    },
    timelines() {
      return this.timelineStore.forVideo(this.$route.params.id);
    },
    shots() {
      return this.shotStore.shots;
    },

    ...mapStores(
      useVideoStore,
      usePlayerStore,
      useShotStore,
      useTimelineStore,
      useTimelineSegmentStore,
      useShortcutStore
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
    ShotCard,
    Timeline,
    TimeSelector,
    EntitiesCard,
    CurrentEntitiesOverView,
    ModalTimelineSegmentAnnotate,
  },
};
</script>

<style scoped>
.logo>img {
  max-height: 56px;
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
