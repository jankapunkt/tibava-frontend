<template>
  <div ref="container" style="width: 100%; min-height: 100px">
    <canvas style="width: 100%" ref="canvas" resize> </canvas>
    <v-menu
      v-model="timelineMenu.show"
      :position-x="timelineMenu.x"
      :position-y="timelineMenu.y"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item link v-on:click="onCopyTimeline">
          <v-list-item-title>
            <v-icon left>{{ "mdi-content-copy" }}</v-icon>
            {{ $t("timeline.duplicate") }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item>
          <ModalRenameTimeline
            :timeline="timelineMenu.selected"
            @close="timelineMenu.show = false"
          />
          <!-- @close="menu = false" /> -->
        </v-list-item>
        <!-- <v-list-item link v-on:click="onRenameTimeline">
          <v-list-item-title>
            <v-icon left>{{ "mdi-pencil" }}</v-icon>
            {{ $t("timeline.rename") }}
          </v-list-item-title>
        </v-list-item> -->
        <v-list-item link v-on:click="onDeleteTimeline">
          <v-list-item-title>
            <v-icon left>{{ "mdi-delete" }}</v-icon>
            {{ $t("timeline.delete") }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu
      v-model="segmentMenu.show"
      :position-x="segmentMenu.x"
      :position-y="segmentMenu.y"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item link v-on:click="onAnnotateSegment">
          <v-list-item-title>
            <v-icon left>{{ "mdi-pencil" }}</v-icon>
            {{ $t("timelineSegment.annotate") }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item link v-on:click="onDeleteSegment">
          <v-list-item-title>
            <v-icon left>{{ "mdi-delete" }}</v-icon>
            {{ $t("timelineSegment.delete") }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item link v-on:click="onSplitSegment">
          <v-list-item-title>
            <v-icon left>{{ "mdi-content-cut" }}</v-icon>
            {{ $t("timelineSegment.split") }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="selectedTimelineSegment.length > 1"
          link
          v-on:click="onMergeSegments"
        >
          <v-list-item-title>
            <v-icon left>{{ "mdi-merge" }}</v-icon>
            {{ $t("timelineSegment.merge") }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import TimeMixin from "../mixins/time";
import ModalRenameTimeline from "@/components/ModalRenameTimeline.vue";
import {
  AnnotationTimeline,
  TimelineHeader,
  TimeScale,
  TimeBar,
} from "../plugins/draw";
import paper from "paper";

import * as PIXI from "pixi.js";
import { DropShadowFilter } from "pixi-filters";

export default {
  mixins: [TimeMixin],
  props: {
    time: {
      type: Number,
    },
    timelines: {},
    startTime: {
      type: Number,
      default: 0,
    },
    endTime: {
      type: Number,
      default: 10,
    },
    selectedTimelineSegment: {
      default: [],
      type: Array,
    },
    selectedTimeline: {
      default: [],
      type: Array,
    },
    headerWidth: {
      type: Number,
      default: 100,
    },
    scaleHeight: {
      type: Number,
      default: 40,
    },
    timelineHeight: {
      type: Number,
      default: 50,
    },
    gap: {
      type: Number,
      default: 4,
    },
    headerStyle: {
      type: Object,
      default: () => {
        return {
          shadowColor: "rgba(0, 0, 0, 0.25)",
          shadowBlur: 6,
          shadowOffset: { x: 0, y: 3 },
          fillColor: "white",
        };
      },
    },

    timeStyle: {
      type: Object,
      default: () => {
        return {
          shadowColor: "rgba(0, 0, 0, 0.25)",
          shadowBlur: 6,
          shadowOffset: { x: 0, y: 3 },
          fillColor: "white",
        };
      },
    },
    timelineStyle: {
      type: Object,
      default: () => {
        return {
          shadowColor: "rgba(0, 0, 0, 0.25)",
          shadowBlur: 6,
          shadowOffset: { x: 0, y: 3 },
          fillColor: "white",
        };
      },
    },

    segmentStyle: {
      type: Object,
      default: () => {
        return {
          fillColor: "red",
        };
      },
    },
    width: {},
  },
  data() {
    return {
      app: null,
      timelineObjects: [],
      timeScaleObjects: [],
      timeBarsObjects: [],

      canvasWidth: null,
      canvasHeight: null,
      containerWidth: 100,
      containerHeight: 100,

      // Context
      timelineMenu: {
        show: false,
        x: null,
        y: null,
        selected: null,
      },
      segmentMenu: {
        show: false,
        x: null,
        y: null,
        selected: null,
      },
      // seek
      targetTime: 0,
      //segment_list
      timelineSegments: [],
    };
  },
  methods: {
    draw() {
      this.timeScale =
        (this.containerWidth - this.headerWidth - 5 * this.gap) /
        (this.endTime - this.startTime);
      this.drawTimeline();
      this.drawTimelineHeader();
      this.drawScale();
      this.drawTimeBar();
    },
    drawTimeBar() {
      if (this.timeBarsContainer) {
        this.app.stage.removeChild(this.timeBarsContainer);
      }

      this.timeBarsContainer = new PIXI.Container();
      this.timeBarsObjects = [];

      const x = this.timeToX(this.startTime);
      const y = this.gap;
      const width = this.timeToX(this.endTime) - x;
      const height = window.innerHeight;

      let timeline = new TimeBar(
        x,
        y,
        width,
        height,
        1,
        this.startTime,
        this.endTime
      );

      this.timeBarsContainer.addChild(timeline);
      this.timeBarsObjects.push(timeline);
      this.app.stage.addChild(this.timeBarsContainer);
    },
    drawScale() {
      if (this.timeScalesContainer) {
        this.app.stage.removeChild(this.timeScalesContainer);
      }

      this.timeScalesContainer = new PIXI.Container();
      this.timeScaleObjects = [];

      const x = this.timeToX(this.startTime);
      const y = this.gap;
      const width = this.timeToX(this.endTime) - x;
      const height = this.scaleHeight;

      let timeline = new TimeScale(
        x,
        y,
        width,
        height,
        this.startTime,
        this.endTime
      );

      this.timeScalesContainer.addChild(timeline);
      this.timeScaleObjects.push(timeline);
      this.app.stage.addChild(this.timeScalesContainer);
    },
    drawTimelineHeader() {
      if (this.timelineHeadersContainer) {
        this.app.stage.removeChild(this.timelineHeadersContainer);
      }

      this.timelineHeadersContainer = new PIXI.Container();
      this.timelineHeaderObjects = [];
      this.timelines.forEach((e, i) => {
        const x = this.gap;
        const y =
          (this.gap + this.timelineHeight) * i +
          this.scaleHeight +
          2 * this.gap;
        const width = this.headerWidth;
        const height = this.timelineHeight;

        let timeline = new TimelineHeader(e, x, y, width, height);

        timeline.on("timelineRightDown", (ev) => {
          const point = this.mapToGlobal(ev.event.data.global);
          this.timelineMenu.show = true;
          this.timelineMenu.x = point.x;
          this.timelineMenu.y = point.y;
          this.timelineMenu.selected = ev.timeline.timeline.id;
          this.$nextTick(() => {
            this.showMenu = true;
          });
        });
        this.timelineHeadersContainer.addChild(timeline);
        this.timelineHeaderObjects.push(timeline);
      });
      this.app.stage.addChild(this.timelineHeadersContainer);
    },
    drawTimeline() {
      let startTime = 0;
      if (this.startTime) {
        startTime = this.startTime;
      }

      if (this.timelinesContainer) {
        this.app.stage.removeChild(this.timelinesContainer);
      }

      this.timelinesContainer = new PIXI.Container();
      this.timelineObjects = [];
      this.timelines.forEach((e, i) => {
        const x = this.timeToX(startTime);
        const y =
          (this.gap + this.timelineHeight) * i +
          this.scaleHeight +
          2 * this.gap;
        const width = this.timeToX(this.endTime) - x;
        const height = this.timelineHeight;

        let timeline = new AnnotationTimeline(
          e,
          x,
          y,
          width,
          height,
          this.startTime,
          this.endTime
        );

        timeline.on("segmentRightDown", (ev) => {
          const point = this.mapToGlobal(ev.event.data.global);
          this.segmentMenu.show = true;
          this.segmentMenu.x = point.x;
          this.segmentMenu.y = point.y;
          this.segmentMenu.selected = ev.segment.segment.id;
          this.$nextTick(() => {
            this.showMenu = true;
          });
        });
        timeline.on("segmentClick", (ev) => {
          if (ev.event.data.originalEvent.ctrlKey) {
            this.$emit("addSelection", ev.segment.segment.id);
          } else {
            this.$emit("select", ev.segment.segment.id);
          }
          const targetTime = this.xToTime(ev.event.data.global.x);
          console.log(targetTime);
          this.$emit("update:time", targetTime);
        });
        this.timelinesContainer.addChild(timeline);
        this.timelineObjects.push(timeline);
      });
      this.app.stage.addChild(this.timelinesContainer);
    },
    drawSelection(selectedTimelineSegment) {
      if (
        selectedTimelineSegment &&
        selectedTimelineSegment.length > 0 &&
        this.timelineObjects &&
        this.timelineObjects.length > 0
      ) {
        selectedTimelineSegment.forEach((e) => {
          if (
            this.timelineObjects[e.timeline] &&
            this.timelineObjects[e.timeline].segments.length > 0
          ) {
            let segment = this.timelineObjects[e.timeline].segments[e.segment];
            if (segment) {
              segment.selected = true;
            }
          }
        });
      }
    },
    removeSelection(selectedTimelineSegment) {
      if (
        selectedTimelineSegment &&
        selectedTimelineSegment.length > 0 &&
        this.timelineObjects &&
        this.timelineObjects.length > 0
      ) {
        selectedTimelineSegment.forEach((e) => {
          if (
            this.timelineObjects[e.timeline] &&
            this.timelineObjects[e.timeline].segments.length > 0
          ) {
            let segment = this.timelineObjects[e.timeline].segments[e.segment];
            if (segment) {
              segment.selected = false;
            }
          }
        });
      }
    },
    timeToX(time) {
      return (
        this.headerWidth +
        3 * this.gap +
        this.timeScale * (time - this.startTime)
      );
    },
    xToTime(x) {
      return (
        (x - this.headerWidth - 3 * this.gap) / this.timeScale + this.startTime
      );
    },
    mapToGlobal(point) {
      const screenRect = this.app.screen;
      const canvasRect = this.$refs.canvas.getBoundingClientRect();

      const windowsX =
        (point.x / screenRect.width) * canvasRect.width + canvasRect.x;
      const windowsY =
        (point.y / screenRect.height) * canvasRect.height + canvasRect.y;

      return { x: windowsX, y: windowsY };
    },
    onCopyTimeline() {
      let id = this.timelineMenu.selected;
      this.$emit("copyTimeline", id);
    },
    onRenameTimeline() {
      let id = this.timelineMenu.selected;
      this.$emit("renameTimeline", id);
    },
    onDeleteTimeline() {
      let id = this.timelineMenu.selected;
      this.$emit("deleteTimeline", id);
    },
    onAnnotateSegment() {
      let id = this.segmentMenu.selected;
      this.$emit("annotateSegment", id);
    },
    onColoringSegment() {
      let id = this.segmentMenu.selected;
      this.$emit("coloringSegment", id);
    },
    onDeleteSegment() {
      let id = this.segmentMenu.selected;
      this.$emit("deleteSegment", id);
    },
    onSplitSegment() {
      let id = this.segmentMenu.selected;
      this.$emit("splitSegment", id);
    },
    onMergeSegments() {
      this.$emit("mergeSegments");
    },
    onResize(event) {
      this.$nextTick(() => {
        console.log("resize");
        this.draw();
        this.$emit("resize");
      });
    },
  },
  watch: {
    duration() {
      this.draw();
    },
    startTime(value) {
      this.timelineObjects.forEach((e) => {
        e.startTime = value;
      });
      this.timeScaleObjects.forEach((e) => {
        e.startTime = value;
      });
      this.timeBarsObjects.forEach((e) => {
        e.startTime = value;
      });
    },
    endTime(value) {
      this.timelineObjects.forEach((e) => {
        e.endTime = value;
      });
      this.timeScaleObjects.forEach((e) => {
        e.endTime = value;
      });
      this.timeBarsObjects.forEach((e) => {
        e.endTime = value;
      });
    },
    timelines(values) {
      this.draw();
    },
    time(value) {
      this.timeBarsObjects.forEach((e) => {
        e.time = value;
      });
    },
    selectedTimelineSegment(newSelection, oldSelection) {
      this.removeSelection(oldSelection);
      this.drawSelection(newSelection);
    },
  },
  computed: {
    computedHeight() {
      return (
        this.timelines.length * (this.timelineHeight + this.gap) +
        this.scaleHeight +
        3 * this.gap
      );
    },
  },
  mounted() {
    this.containerWidth = this.$refs.container.clientWidth;
    this.app = new PIXI.Application({
      width: this.containerWidth,
      height: this.containerHeight,
      antialias: true,
      transparent: true,
      view: this.$refs.canvas,
      resizeTo: this.$refs.canvas,
    });

    this.$refs.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    this.app.ticker.add(() => {
      if (this.$refs.container.clientWidth != this.containerWidth) {
        this.containerWidth = this.$refs.container.clientWidth;
        this.draw();
      }
      if (this.computedHeight != this.containerHeight) {
        this.containerHeight = this.computedHeight;
        this.$refs.container.style.height = this.computedHeight;
        this.$refs.canvas.height = this.computedHeight;
        this.app.resize();
        this.draw();
      }
    });
    this.draw();
  },
  components: {
    ModalRenameTimeline,
  },
};
</script>
