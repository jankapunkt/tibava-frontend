<template>
  <div style="width: 100%; min-height: 100px">
    <v-row>
      <v-col cols="3" style="margin: 0px; padding: 0px; padding-right: 10px">
        <div style="height: 40px; margin-top: 4px; margin-bottom: 4px">
          <v-menu bottom right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                style="height: 40px; width: 100%; height: 100%"
              >
                <v-icon left>mdi-cog</v-icon>
                {{ $t("modal.timeline.menu.title") }}
              </v-btn>
            </template>
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

        <DraggableTree
          draggable="draggable"
          cross-tree="cross-tree"
          class="timelinetree"
          :data="timelineHierarchy"
          :indent="25"
          :space="0"
          @change="change"
          @nodeOpenChanged="nodeOpenChanged"
        >
          <div slot-scope="{ data, store }">
            <template v-if="!data.isDragPlaceHolder">
              <v-app-bar
                dense
                color="white"
                style="
                  height: 50px;
                  margin-top: 4px;
                  margin-bottom: 4px;
                  width: 100%;
                "
              >
                <v-icon
                  v-if="data.children && data.children.length"
                  @click="store.toggleOpen(data)"
                  >{{ data.open ? "mdi-minus" : "mdi-plus" }}</v-icon
                >
                <!-- <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-app-bar-title v-bind="attrs" v-on="on">
                      {{ data.text }}
                    </v-app-bar-title>
                  </template>
                  <span>{{ data.text }}</span>
                </v-tooltip> -->
                <v-app-bar-title>
                  {{ data.text }}
                </v-app-bar-title>

                <v-spacer></v-spacer>

                <v-btn icon small disabled>
                  <v-icon>mdi-eye-off</v-icon>
                </v-btn>

                <v-menu bottom right>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small>
                      <v-icon v-bind="attrs" v-on="on"
                        >mdi-dots-vertical</v-icon
                      >
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item>
                      <ModalCopyTimeline :timeline="data.id" />
                    </v-list-item>
                    <v-list-item>
                      <ModalRenameTimeline :timeline="data.id" />
                    </v-list-item>
                    <v-list-item v-if="data.type == 'R'">
                      <ModalVisualizationTimeline :timeline="data.id" />
                    </v-list-item>
                    <v-list-item>
                      <ModalDeleteTimeline :timeline="data.id" />
                    </v-list-item>
                  </v-list>
                </v-menu> </v-app-bar
            ></template>
          </div>
        </DraggableTree>
      </v-col>

      <v-col ref="container" cols="9" style="margin: 0; padding: 0">
        <canvas style="width: 100%" ref="canvas" resize> </canvas>
      </v-col>
    </v-row>

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
  ColorTimeline,
  ScalarLineTimeline,
  ScalarColorTimeline,
  TimeScale,
  TimeBar,
  HistTimeline,
} from "../plugins/draw";

import * as PIXI from "pixi.js";
import { NoiseFilter } from "@pixi/filter-noise";

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
      default: 0,
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
    nodeOpenChanged(node) {
      // on a node is closed or open(node)
      this.$store.dispatch("timeline/setcollapse", {
        timelineId: node.id,
        collapse: !node.open,
      });
    },
    change(node, targetTree, oldTree) {
      // after drop, only when the node position changed

      // set new order of timelines
      function timelineOrder(elem) {
        var hierarchy = [];
        elem.forEach((e) => {
          hierarchy.push(e.id);
          hierarchy.push.apply(hierarchy, timelineOrder(e.children));
        });
        return hierarchy;
      }

      let order = timelineOrder(this.timelineHierarchy);
      this.$store.dispatch("timeline/setorder", {
        order: order,
      });

      // set new parent of node
      this.$store.dispatch("timeline/setparent", {
        timelineId: node.id,
        parentId: node.parent.id,
      });
    },
    draw() {
      this.drawTimeline();
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
    drawTimeline() {
      let startTime = 0;
      if (this.startTime) {
        startTime = this.startTime;
      }

      if (this.timelinesContainer) {
        this.app.stage.removeChild(this.timelinesContainer);
      }

      let self = this;
      function parentCollapsed(e) {
        if (!e.parent_id) {
          return false;
        }

        let parent_id = e.parent_id;

        while (parent_id != null) {
          let parent = self.$store.getters["timeline/get"](parent_id);
          console.log(parent);
          parent_id = parent.parent_id;
          if (parent.collapse) {
            return true;
          }
        }

        return false;
      }

      this.timelinesContainer = new PIXI.Container();
      this.timelineObjects = [];
      this.timelines
        .filter((e) => !parentCollapsed(e))
        .forEach((e, i) => {
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
              width,
              height,
              this.startTime,
              this.endTime
            );

            timeline.x = x;
            timeline.y = y;
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
            if (e.visualization == "C") {
              timeline = new ColorTimeline({
                width: width,
                height: height,
                startTime: this.startTime,
                endTime: this.endTime,
                data: e.plugin.data,
                renderer: this.app.renderer,
                resolution: 0.1,
              });
            }
            if (e.visualization == "SC") {
              timeline = new ScalarColorTimeline({
                width: width,
                height: height,
                startTime: this.startTime,
                endTime: this.endTime,
                data: e.plugin.data,
                renderer: this.app.renderer,
                resolution: 0.1,
              });
            }
            if (e.visualization == "SL") {
              timeline = new ScalarLineTimeline({
                width: width,
                height: height,
                startTime: this.startTime,
                endTime: this.endTime,
                data: e.plugin.data,
                renderer: this.app.renderer,
                resolution: 0.1,
              });
            }
            if (e.visualization == "H") {
              timeline = new HistTimeline({
                width: width,
                height: height,
                startTime: this.startTime,
                endTime: this.endTime,
                data: e.plugin.data,
                renderer: this.app.renderer,
                resolution: 0.1,
              });
            }
          }

          if (timeline) {
            timeline.x = x;
            timeline.y = y;
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
      return this.timeScale * (time - this.startTime);
    },
    xToTime(x) {
      return x / this.timeScale + this.startTime;
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
    duration(value) {
      // this.draw();
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
          if (e.parent_id == parent) {
            let children = findChildren(elem, e.id);
            hierarchy.push({
              id: e.id,
              text: e.name,
              children: children,
              type: e.type,
              open: !e.collapse,
            });
          }
        });
        return hierarchy;
      }
      this.timelineHierarchy = findChildren(values, null);
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
      return this.containerWidth / (this.endTime - this.startTime);
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

<style>
.draggable-placeholder-inner {
  border: 1px solid #ae1313;
  background: #ae131377;
}
</style>