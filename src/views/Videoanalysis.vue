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
                {{ $store.state.video.current.name }}
              </v-card-title>
            </v-row>

            <v-row class="flex-grow-1">
              <v-col>
                <VideoPlayer
                  :video="$store.state.video.current"
                  :time="targetTime"
                  @resize="onVideoResize"
                  @timeUpdate="onTimeUpdate"
                />
              </v-col>
            </v-row>
            <v-row class="mb-2 px-4">
              <TimeSelector
                width="100%"
                :duration="duration"
                @resize="onVideoResize"
                :endTime.sync="endTime"
                :startTime.sync="startTime"
              />
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="6">
          <v-card
            class="overflow-auto"
            elevation="2"
            ref="resultCard"
            :height="resultCardHeight"
          >
            <v-tabs centered>
              <v-tabs-slider />
              <v-tab>Shots</v-tab>
              <v-tab disabled>Persons</v-tab>
              <v-tab disabled>Scenes</v-tab>

              <v-tab-item>
                <ShotCard
                  v-for="item in shots"
                  v-bind:key="item.id"
                  :shot="item"
                  @seek="onTagetTimeChange"
                />
              </v-tab-item>
              <v-tab-item> PERSONS </v-tab-item>
              <v-tab-item> SCENES </v-tab-item>
            </v-tabs>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="fill-height ma-2">
        <v-col>
          <v-card
            class="d-flex flex-column flex-nowrap overflow-auto"
            max-width="100%"
            elevation="2"
          >
            <v-card-title> Annotation Timeline </v-card-title>
            <v-flex grow class="mb-2 px-4">
              <Timeline
                ref="timeline"
                width="100%"
                :duration="duration"
                :time="videoTime"
                :timelines="timelines"
                :startTime="startTime"
                :endTime="endTime"
                :selectedTimelineSegment="selectedTimelineSegment"
                :selectedTimeline="selectedTimeline"
                @copyTimeline="onCopyTimeline"
                @renameTimeline="onRenameTimeline"
                @deleteTimeline="onDeleteTimeline"
                @annotateSegment="onAnnotateSegment"
                @coloringSegment="onColoringSegment"
                @splitSegment="onSplitSegment"
                @mergeSegments="onMergeSegments"
                @mergeSegmentsLeft="onMergeSegmentsLeft"
                @mergeSegmentsRight="onMergeSegmentsRight"
                @deleteSegment="onDeleteSegment"
                @update:time="onTagetTimeChange"
                @addSelection="onAddSelection"
                @select="onSelect"
              >
              </Timeline>

              <ModalTimelineSegmentAnnotate
                :show.sync="annotationDialog.show"
                :timelineSegment="annotationDialog.selectedTimelineSegment"
                :annotations="annotations"
                :annotationCategories="annotationCategories"
              >
              </ModalTimelineSegmentAnnotate>
            </v-flex>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import VideoPlayer from "@/components/VideoPlayer.vue";
import ShotCard from "@/components/ShotCard.vue";
import Timeline from "@/components/Timeline.vue";
import TimeSelector from "@/components/TimeSelector.vue";
import ModalTimelineSegmentAnnotate from "@/components/ModalTimelineSegmentAnnotate.vue";

import * as Keyboard from "../plugins/keyboard.js";
// import store from "../store/index.js";

export default {
  data() {
    return {
      anotation_dialog: false,
      videoTime: 0,
      targetTime: 0,
      startTime: 0,
      endTime: 0,
      selectedSegment: null,
      addedAnnotation: null,
      labels: [],
      selectedLabel: null,
      //
      annotationDialog: {
        show: false,
        selectedTimelineSegment: null,
      },
      // annotations: [],
      // annotationCategories: [],
      resultCardHeight: 69,

      cursor: {
        type: "segment",
        segment: 0,
        timeline: 0,
      },
      selectedTimelineSegment: [
        {
          type: "segment",
          segment: 0,
          timeline: 0,
        },
      ],
      selectedTimeline: [],
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
      // handling cursor
      let newCursor = {
        type: this.cursor.type,
        timeline: this.cursor.timeline,
        segment: this.cursor.segment,
      };

      if (event.key == "ArrowDown") {
        newCursor.timeline += 1;
        event.preventDefault();
      } else if (event.key == "ArrowUp") {
        newCursor.timeline -= 1;
        event.preventDefault();
      } else if (event.key == "ArrowLeft") {
        newCursor.segment -= 1;
        event.preventDefault();
      } else if (event.key == "ArrowRight") {
        newCursor.segment += 1;
        event.preventDefault();
      } else if (event.key == "Enter") {
        if (this.cursor.type === "segment") {
          this.onAnnotateSegment(this.cursor.id);
          event.preventDefault();
        }
      }
      newCursor.timeline = Math.max(
        Math.min(newCursor.timeline, this.timelines.length - 1),
        0
      );

      newCursor.segment = Math.max(
        Math.min(
          newCursor.segment,
          this.timelines[newCursor.timeline].segments.length - 1
        ),
        0
      );

      const newSegment =
        this.timelines[newCursor.timeline].segments[newCursor.segment];

      newCursor.id = newSegment.id;
      if (
        newCursor.timeline !== this.cursor.timeline ||
        newCursor.segment !== this.cursor.segment
      ) {
        if (event.ctrlKey && newCursor.timeline === this.cursor.timeline) {
          this.selectedTimelineSegment.push(newCursor);
        } else {
          this.selectedTimelineSegment = [newCursor];
        }
        this.setCursor(newCursor, true);
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
          this.$store.dispatch("timelineSegmentAnnotation/toggle", {
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
      this.$store.dispatch("timeline/duplicate", id);
    },
    onRenameTimeline(id) {
      this.$store.dispatch("timeline/rename", id);
    },
    onDeleteTimeline(id) {
      this.$store.dispatch("timeline/delete", id);
    },
    onAnnotateSegment(id) {
      this.annotationDialog.selectedTimelineSegment =
        this.$store.getters["timelineSegment/get"](id);
      console.log(
        `${JSON.stringify(this.annotationDialog.selectedTimelineSegment)}`
      );
      this.$nextTick(() => {
        this.annotationDialog.show = true;
      });
    },
    onColoringSegment(id) {},
    onDeleteSegment(id) {},

    onAddSelection(segmentId) {
      const segmentPos =
        this.$store.getters["timeline/segmentPosition"](segmentId);
      console.log(segmentPos);

      const selection = {
        timeline: segmentPos.timeline,
        segment: segmentPos.segment,
      };
      this.selectedTimelineSegment.push(selection);
      this.setCursor({
        type: "segment",
        timeline: selection.timeline,
        segment: selection.segment,
        id: segmentId,
      });
    },
    onSelect(segmentId) {
      console.log("Timeline::onSelect");
      console.log(segmentId);
      const segmentPos =
        this.$store.getters["timeline/segmentPosition"](segmentId);
      console.log(segmentPos);

      const selection = {
        timeline: segmentPos.timeline,
        segment: segmentPos.segment,
      };
      this.selectedTimelineSegment = [selection];
      this.setCursor({
        type: "segment",
        timeline: selection.timeline,
        segment: selection.segment,
        id: segmentId,
      });
    },

    onSegmentSelected(id) {
      this.cursorSegment = id;
      // this.$store.dispatch("timeline/delete", id);
    },
    onSplitSegment(id) {
      this.$store.dispatch("timelineSegment/split", {
        timelineSegmentId: id,
        time: this.targetTime,
      });
    },
    onMergeSegments(id) {
      const timelineSegmentIds = this.selectedTimelineSegment.map((e) => {
        return this.$store.getters["timeline/getSegmentByPosition"](
          e.timeline,
          e.segment
        );
      });
      console.log(timelineSegmentIds);
      this.$store.dispatch("timelineSegment/merge", {
        timelineSegmentIds: timelineSegmentIds,
      });
    },
    onMergeSegmentsLeft() {
      const selectedSegmentId = this.cursor.id;

      const leftSegmentIdx = this.cursor.segment - 1;
      const leftSegmentId = this.$store.getters[
        "timeline/getSegmentByPosition"
      ](this.cursor.timeline, leftSegmentIdx);

      if (leftSegmentId == null) {
        return;
      }

      this.$store.dispatch("timelineSegment/merge", {
        timelineSegmentIds: [selectedSegmentId, leftSegmentId],
      });
    },
    onMergeSegmentsRight() {
      const selectedSegmentId = this.cursor.id;

      const rightSegmentIdx = this.cursor.segment + 1;
      const rightSegmentId = this.$store.getters[
        "timeline/getSegmentByPosition"
      ](this.cursor.timeline, rightSegmentIdx);

      if (rightSegmentId == null) {
        return;
      }

      this.$store.dispatch("timelineSegment/merge", {
        timelineSegmentIds: [selectedSegmentId, rightSegmentId],
      });
    },
    onAppendAnnotation(evt) {
      evt.preventDefault();
      this.$store.dispatch("timeline/annotate", {
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
    async fetch() {
      await this.$store.dispatch("video/fetch", {
        videoId: this.$route.params.id,
      });
    },
  },
  computed: {
    duration() {
      let duration = this.$store.state.video.current.duration;
      return duration;
    },
    annotationCategories() {
      return this.$store.getters["annotationCategory/all"];
    },
    annotationsLut() {
      return this.$store.state.annotation.annotations;
    },
    annotations() {
      let annotations = this.$store.getters["annotation/all"];

      annotations = annotations.map((e) => {
        if ("category_id" in e) {
          e["category"] = this.$store.getters["annotationCategory/get"](
            e.category_id
          );
        }
        return e;
      });
      return annotations;
    },
    shortcutAnnotationMap() {
      const annotationShortcuts = this.$store.getters["annotationShortcut/all"];
      const shortcuts = this.$store.getters["shortcut/all"];

      let lutShortcuts = {};
      shortcuts.forEach((e) => {
        lutShortcuts[e.id] = e;
      });

      let shortcutAnnotationMap = {};
      annotationShortcuts.forEach((e) => {
        const keys = Keyboard.generateKeysString(
          lutShortcuts[e.shortcut_id].keys
        );
        if (shortcutAnnotationMap[keys] == null) {
          shortcutAnnotationMap[keys] = [];
        }
        shortcutAnnotationMap[keys].push(e.annotation_id);
      });
      return shortcutAnnotationMap;
    },
    timelines() {
      let timelines = this.$store.getters["timeline/forVideo"](
        this.$route.params.id
      );
      timelines.forEach((e) => {
        if (e.type == "A") {
          let segments = this.$store.getters["timelineSegment/forTimeline"](
            e.id
          );
          segments.forEach((s) => {
            let annotations = this.$store.getters[
              "timelineSegmentAnnotation/forTimelineSegment"
            ](s.id);

            annotations.forEach((a) => {
              a.annotation = this.$store.getters["annotation/get"](
                a.annotation_id
              );
            });

            annotations.forEach((a) => {
              a.category = this.$store.getters["annotationCategory/get"](
                a.category_id
              );
            });
            s.annotations = annotations;
            if (annotations.length > 0) {
            }
          });
          e.segments = segments;
        }
        if (e.type == "R" && "plugin_run_result_id" in e) {
          const result = this.$store.getters["pluginRunResult/get"](
            e.plugin_run_result_id
          );
          if (result) {
            e.plugin = { data: result.data, type: result.type };
          }
        }
      });

      return timelines;
    },

    shots() {
      let shotdetection = this.$store.getters["pluginRun/forVideo"](
        this.$route.params.id
      )
        .filter((e) => {
          return e.type == "shotdetection";
        })
        .sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
      if (!shotdetection.length) {
        return [];
      }

      shotdetection = shotdetection.at(-1);
      let results = [];
      // if len(shotdetection)
      if ("results" in shotdetection) {
        results = shotdetection.results.map((e) => {
          return {
            id: e.shot_id,
            // start: e.start_time,
            // end: e.end_time,
            start: e.start_time_sec,
            end: e.end_time_sec,
          };
        });
      }

      let thumbnail = this.$store.getters["pluginRun/forVideo"](
        this.$route.params.id
      )
        .filter((e) => {
          return e.type == "thumbnail";
        })
        .sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

      if (!thumbnail.length) {
        return results;
      }
      thumbnail = thumbnail.at(-1);

      // TODO this is not realy stable
      let thumbnail_dict = thumbnail.results.reduce(
        (a, b) => ((a[b.time] = b.url), a),
        {}
      );

      results = results.map((e) => {
        let duration = e.end - e.start;

        let start_thumb_time = 0;
        let mid_thumb_time = 0;
        let end_thumb_time = 0;

        if (duration < 2) {
          start_thumb_time = Math.ceil(e.start + duration / 2);
          mid_thumb_time = Math.round(e.start + duration / 2);
          end_thumb_time = Math.floor(e.start + duration / 2);
        } else {
          start_thumb_time = Math.ceil(e.start + duration / 5);
          mid_thumb_time = Math.round(e.start + duration / 2);
          end_thumb_time = Math.floor(e.start + (duration * 4) / 5);
        }

        if (start_thumb_time > mid_thumb_time) {
          start_thumb_time = mid_thumb_time;
        }

        if (mid_thumb_time > end_thumb_time) {
          end_thumb_time = mid_thumb_time;
        }

        return {
          id: e.id,
          start: e.start,
          end: e.end,
          thumbnails: [
            thumbnail_dict[start_thumb_time],
            thumbnail_dict[mid_thumb_time],
            thumbnail_dict[end_thumb_time],
          ],
        };
      });
      return results;
    },
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    // this.fetch_data();
    // this.$store.dispatch('')
    this.fetch();
  },
  mounted() {
    this.resultCardHeight = this.$refs.videoCard.$el.clientHeight;
    this.$refs.main.$el.focus();
    // document.addEventListener("keydown", (e) => {

    // });
  },
  watch: {
    // call again the method if the route changes
    $route: "fetch",
    currentTime() {
      this.videoTime = this.currentTime;
    },
    duration: {
      handler: function (newValue) {
        this.endTime = newValue;
      },
      deep: true,
    },
  },
  components: {
    VideoPlayer,
    ShotCard,
    Timeline,
    TimeSelector,
    ModalTimelineSegmentAnnotate,
  },
};
</script>

<style scoped>
.logo > img {
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
