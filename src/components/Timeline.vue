<template>
  <div ref="container" style="width: 100%; min-height: 100px">
    <!-- <DraggableTree
      :data="timelineHierarchy"
      draggable="draggable"
      cross-tree="cross-tree"
      :indent="30"
      :space="0"
    >
      <div slot-scope="{ data, store }">
        <template v-if="!data.isDragPlaceHolder"
          ><b
            v-if="data.children &amp;&amp; data.children.length"
            @click="store.toggleOpen(data)"
            >{{ data.open ? "-" : "+" }}&nbsp;</b
          ><span>{{ data.text }}</span></template
        >
      </div>
    </DraggableTree> -->

    <v-row>
      <v-col cols="2" style="margin: 0; padding: 0">
        <div
          style="height: 40px; margin-top: 4px; margin-bottom: 4px; width: 100%"
        ></div>

        <v-app-bar
          dense
          v-for="timeline in timelines"
          :key="timeline.id"
          style="height: 50px; margin-top: 4px; margin-bottom: 4px; width: 100%"
        >
          <v-app-bar-title>{{ timeline.name }}</v-app-bar-title>
          <v-spacer></v-spacer>
          <v-btn icon small>
            <v-icon>mdi-eye-off</v-icon>
          </v-btn>
          <v-btn icon small>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </v-app-bar>
      </v-col>

      <v-col cols="10" style="margin: 0; padding: 0">
        <canvas style="width: 100%" ref="canvas" resize> </canvas>
      </v-col>
    </v-row>

    <v-menu
      v-model="timelineMenu.show"
      :position-x="timelineMenu.x"
      :position-y="timelineMenu.y"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item>
          <ModalCopyTimeline
            :timeline="timelineMenu.selected"
            @close="timelineMenu.show = false"
          />
        </v-list-item>

        <v-list-item>
          <ModalRenameTimeline
            :timeline="timelineMenu.selected"
            @close="timelineMenu.show = false"
          />
        </v-list-item>
        <v-list-item v-if="timelineMenu.type == 'R'">
          <ModalVisualizationTimeline
            :timeline="timelineMenu.selected"
            @close="timelineMenu.show = false"
          />
        </v-list-item>
        <v-list-item>
          <ModalDeleteTimeline
            :timeline="timelineMenu.selected"
            @close="timelineMenu.show = false"
          />
        </v-list-item>
      </v-list>
    </v-menu>
    <v-tooltip
      top
      v-model="segmentContext.show"
      :position-x="segmentContext.x"
      :position-y="segmentContext.y"
      absolute
      offset-y
    >
      <span>{{ segmentContext.label }}</span>
    </v-tooltip>
    <v-menu
      v-model="segmentMenu.show"
      :position-x="segmentMenu.x"
      :position-y="segmentMenu.y - 10"
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

        <!-- <v-list-item link v-on:click="onDeleteSegment">
          <v-list-item-title>
            <v-icon left>{{ "mdi-delete" }}</v-icon>
            {{ $t("timelineSegment.delete") }}
          </v-list-item-title>
        </v-list-item> -->

        <v-list-item link v-on:click="onSplitSegment">
          <v-list-item-title>
            <v-icon left>{{ "mdi-content-cut" }}</v-icon>
            {{ $t("timelineSegment.split") }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item link v-on:click="onMergeSegmentsLeft">
          <v-list-item-title>
            <v-icon left>{{ "mdi-arrow-expand-left" }}</v-icon>
            {{ $t("timelineSegment.mergeleft") }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item link v-on:click="onMergeSegmentsRight">
          <v-list-item-title>
            <v-icon left>{{ "mdi-arrow-expand-right" }}</v-icon>
            {{ $t("timelineSegment.mergeright") }}
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
    <v-menu
      v-model="menu.show"
      :position-x="menu.x"
      :position-y="menu.y"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item link>
          <ModalCreateTimeline @close="menu.show = false" />
        </v-list-item>
        <v-list-item link>
          <ModalImportTimeline @close="menu.show = false" />
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import TimeMixin from "../mixins/time";
import { DraggableTree } from "vue-draggable-nested-tree";
import ModalRenameTimeline from "@/components/ModalRenameTimeline.vue";
import ModalCopyTimeline from "@/components/ModalCopyTimeline.vue";
import ModalDeleteTimeline from "@/components/ModalDeleteTimeline.vue";
import ModalCreateTimeline from "@/components/ModalCreateTimeline.vue";
import ModalVisualizationTimeline from "@/components/ModalVisualizationTimeline.vue";
import ModalImportTimeline from "@/components/ModalImportTimeline.vue";
import {
  AnnotationTimeline,
  ScalarLineTimeline,
  ScalarColorTimeline,
  TimelineHeader,
  TimeScale,
  TimeBar,
  Button,
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

      timelineHierarchy: [],

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
        type: "S",
      },
      segmentMenu: {
        show: false,
        x: null,
        y: null,
        selected: null,
      },
      segmentContext: {
        show: false,
        x: null,
        y: null,
        selected: null,
        label: null,
      },
      menu: {
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
      this.drawTimeline();
      // this.drawTimelineHeader();
      this.drawScale();
      // this.drawTimeBar();
      // this.drawMenu();
    },
    drawMenu() {
      if (this.menuContainer) {
        this.app.stage.removeChild(this.menuContainer);
      }

      this.menuContainer = new PIXI.Container();
      this.menuObjects = [];

      const x = 5;
      const y = 5;
      const width = 80;
      const height = 80;

      let button = new Button(
        x,
        y,
        width,
        height,
        require("../assets/menu_24.png")
      );

      button.on("click", (ev) => {
        const point = this.mapToGlobal(ev.data.global);
        this.menu.show = true;
        this.menu.x = point.x;
        this.menu.y = point.y;
      });
      this.menuContainer.addChild(button);
      this.menuObjects.push(button);
      this.app.stage.addChild(this.menuContainer);
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
        this.time,
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

        let timeline = new TimelineHeader(e, 0, 0, width, height);
        timeline.x = x;
        timeline.y = y;

        timeline.on("timelineRightDown", (ev) => {
          const point = this.mapToGlobal(ev.event.data.global);
          this.timelineMenu.show = true;
          this.timelineMenu.x = point.x;
          this.timelineMenu.y = point.y;
          this.timelineMenu.type = ev.timeline.timeline.type;
          this.timelineMenu.selected = ev.timeline.timeline.id;
          this.$nextTick(() => {
            this.showMenu = true;
          });
        });

        timeline.on("mousedown", function (ev) {
          console.log("Picked up");
          console.log(
            timeline.x,
            timeline.y,
            ev.data.global.x,
            ev.data.global.y
          );
          // timeline.x = ev.data.global.x - timeline.x / 2;
          timeline.y = ev.data.global.y - timeline.y / 2;
          timeline.dragging = true;
        });

        timeline.on("mousemove", function (ev) {
          console.log("Dragging");

          if (timeline.dragging) {
            // timeline.x = ev.data.global.x - timeline.x / 2;
            timeline.y = ev.data.global.y - timeline.y / 2;
          }
        });

        timeline.on("mouseup", function (ev) {
          console.log("Moving");

          // timeline.x = ev.data.global.x - timeline.x / 2;
          // timeline.y = ev.data.global.y - timeline.y / 2;
          timeline.dragging = false;
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
        var timeline = null;

        if (e.type == "A") {
          timeline = new AnnotationTimeline(
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
            this.$emit("update:time", targetTime);
          });
          timeline.on("segmentOver", (ev) => {
            if (ev.segment.segment.annotations.length > 0) {
              const tooltipPoint = {
                x: ev.event.data.global.x,
                y: ev.segment.y,
              };
              const point = this.mapToGlobal(tooltipPoint);
              this.segmentContext.show = true;
              this.segmentContext.x = point.x;
              this.segmentContext.y = point.y;
              this.segmentContext.selected = ev.segment.segment.id;

              const annotations = ev.segment.segment.annotations.map((e) => {
                return e.annotation.name;
              });
              this.segmentContext.label = annotations.join("; ");
            }
          });
          timeline.on("segmentOut", (ev) => {
            this.segmentContext.show = false;
          });
        } else if (e.type == "R" && "plugin" in e) {
          if (e.visualization == "SC") {
            timeline = new ScalarColorTimeline(
              e,
              x,
              y,
              width,
              height,
              this.startTime,
              this.endTime,
              e.plugin.data
            );
          }
          if (e.visualization == "SL") {
            timeline = new ScalarLineTimeline(
              e,
              x,
              y,
              width,
              height,
              this.startTime,
              this.endTime,
              e.plugin.data
            );
          }
        }

        if (timeline) {
          this.timelinesContainer.addChild(timeline);
          this.timelineObjects.push(timeline);
        }
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
    onMergeSegmentsLeft() {
      this.$emit("mergeSegmentsLeft");
    },
    onMergeSegmentsRight() {
      this.$emit("mergeSegmentsRight");
    },
    onResize(event) {
      this.$nextTick(() => {
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
      function findChildren(elem, parent) {
        var hierarchy = [];
        elem.forEach((e) => {
          if (e.parent == parent) {
            let children = findChildren(elem, e.id);
            hierarchy.push({ id: e.id, text: e.name, children: children });
          }
        });
        return hierarchy;
      }
      console.log(JSON.stringify(values));

      this.timelineHierarchy = findChildren(values, null);
      console.log(JSON.stringify(this.timelineHierarchy));
      console.log(values.length);
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
    timeScale() {
      return (
        (this.containerWidth - this.headerWidth - 5 * this.gap) /
        (this.endTime - this.startTime)
      );
    },
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
      // antialias: true,
      transparent: true,
      view: this.$refs.canvas,
      resizeTo: this.$refs.canvas,
    });

    this.$refs.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    this.app.ticker.add(() => {
      if ("container" in this.$refs && this.$refs.container) {
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
      }
    });
    this.draw();
  },
  components: {
    ModalRenameTimeline,
    ModalCopyTimeline,
    ModalDeleteTimeline,
    ModalCreateTimeline,
    ModalVisualizationTimeline,
    ModalImportTimeline,
    DraggableTree,
  },
};
</script>
