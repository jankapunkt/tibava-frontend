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
    <ModalTimelineSegmentAnnotate :show.sync="annotationDialogShow"/>
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
import ModalTimelineSegmentAnnotate from "@/components/ModalTimelineSegmentAnnotate.vue";

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

import { mapStores } from "pinia";
import { useTimelineStore } from "@/store/timeline";
import { useTimelineSegmentStore } from "@/store/timeline_segment";
import { useTimelineSegmentAnnotationStore } from "@/store/timeline_segment_annotation";
import { useAnnotationStore } from "@/store/annotation";
import { useAnnotationCategoryStore } from "@/store/annotation_category";
import { usePlayerStore } from "@/store/player";
import { useVideoStore } from "@/store/video";
import { usePluginRunResultStore } from "@/store/plugin_run_result";

export default {
  mixins: [TimeMixin],
  props: {
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

      // Some dialog show flags

      annotationDialogShow: false,

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
      this.timelineStore.setCollapse( {
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
      this.timelineStore.setOrder( {
        order: order,
      });

      // set new parent of node
      this.timelineStore.setParent( {
        timelineId: node.id,
        parentId: node.parent.id,
      });
    },
    draw() {
      this.drawTimelines();
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

    drawTimelines() {
      if (this.timelinesContainer) {
        this.app.stage.removeChild(this.timelinesContainer);
      }
      this.timelinesContainer = new PIXI.Container();
      this.timelineObjects = [];

      this.timelines.forEach((e, i) => {
        const x = this.timeToX(this.startTime);
        const y =
          (this.gap + this.timelineHeight) * i +
          this.scaleHeight +
          2 * this.gap;
        const width = this.timeToX(this.endTime) - x;
        const height = this.timelineHeight;

        let timeline = null;
        if (e.type == "A") {
          timeline = this.drawAnnotationTimeline(e, width, height);
        } else if (e.type == "R") {
          timeline = this.drawGraphicTimeline(e, width, height);
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
    drawAnnotationTimeline(timeline, width, height) {
      const timelineSegmentStore = useTimelineSegmentStore();
      const timelineSegmentAnnotationStore =
        useTimelineSegmentAnnotationStore();
      const annotationStore = useAnnotationStore();
      const annotationCategoryStore = useAnnotationCategoryStore();

      let segments = timelineSegmentStore.forTimeline(timeline.id);
      segments.forEach((s) => {
        let annotations = timelineSegmentAnnotationStore.forTimelineSegment(
          s.id
        );
        annotations.forEach((a) => {
          a.annotation = annotationStore.get(a.annotation_id);
        });
        annotations.forEach((a) => {
          a.category = annotationCategoryStore.get(a.category_id);
        });
        s.annotations = annotations;
      });

      timeline.segments = segments;

      let drawnTimeline = new AnnotationTimeline({
        timelineId: timeline.id,
        width:width,
        height:height,
        startTime:this.startTime,
        endTime:this.endTime,
        duration:this.duration,
        data: timeline,
      }
      );
      drawnTimeline.on("segmentRightDown", (ev) => {
        const point = this.mapToGlobal(ev.event.data.global);
        this.segmentMenu.show = true;
        this.segmentMenu.x = point.x;
        this.segmentMenu.y = point.y;
        this.segmentMenu.selected = ev.segment.segment.id;
        this.$nextTick(() => {
          this.showMenu = true;
        });
      });
      drawnTimeline.on("segmentClick", (ev) => {
        if (ev.event.data.originalEvent.ctrlKey) {
          this.timelineSegmentStore.addToSelection(ev.segment.segment.id)
        } else {
          this.timelineSegmentStore.clearSelection()
          this.timelineSegmentStore.addToSelection(ev.segment.segment.id)
        }
        const targetTime = this.xToTime(ev.event.data.global.x);
        this.$emit("update:time", targetTime);
      });
      drawnTimeline.on("segmentOver", (ev) => {
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
      drawnTimeline.on("segmentOut", (ev) => {
        this.segmentContext.show = false;
      });
      return drawnTimeline;
    },
    drawGraphicTimeline(timeline, width, height) {
      const pluginRunResultStore = usePluginRunResultStore();
      if ("plugin_run_result_id" in timeline) {
        const result = pluginRunResultStore.get(timeline.plugin_run_result_id);
        if (result === undefined) {
          return null;
        } else {
          timeline.plugin = { data: result.data, type: result.type };
        }
        if (timeline.visualization == "C") {
          const drawnTimeline = new ColorTimeline({
            timelineId: timeline.id,
            width: width,
            height: height,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            data: timeline.plugin.data,
            renderer: this.app.renderer,
            resolution: 0.1,
          });
          return drawnTimeline;
        }
        if (timeline.visualization == "SC") {
          const drawnTimeline = new ScalarColorTimeline({
            timelineId: timeline.id,
            width: width,
            height: height,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            data: timeline.plugin.data,
            renderer: this.app.renderer,
            resolution: 0.1,
          });
          return drawnTimeline;
        }
        if (timeline.visualization == "SL") {
          const drawnTimeline = new ScalarLineTimeline({
            timelineId: timeline.id,
            width: width,
            height: height,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            data: timeline.plugin.data,
            renderer: this.app.renderer,
            resolution: 0.1,
          });
          return drawnTimeline;
        }
        if (timeline.visualization == "H") {
          const drawnTimeline = new HistTimeline({
            timelineId: timeline.id,
            width: width,
            height: height,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            data: timeline.plugin.data,
            renderer: this.app.renderer,
            resolution: 0.1,
          });
          return drawnTimeline;
        }
      }
      return null;
    },
    drawSelection(selectedTimelineSegments) {
      if (
        selectedTimelineSegments &&
        selectedTimelineSegments.length > 0 &&
        this.timelineObjects &&
        this.timelineObjects.length > 0
      ) {
        selectedTimelineSegments.forEach((selectedTimelineSegment) => {
          this.timelineObjects.filter((timelineObject)=>timelineObject.timelineId === selectedTimelineSegment.timeline_id).forEach((timelineObject) => {
            timelineObject.selected({selected:true, segment:selectedTimelineSegment})
          })
        });
      }
    },
    removeSelection(selectedTimelineSegments) {
      if (
        selectedTimelineSegments &&
        selectedTimelineSegments.length > 0 &&
        this.timelineObjects &&
        this.timelineObjects.length > 0
      ) {
        selectedTimelineSegments.forEach((selectedTimelineSegment) => {
          this.timelineObjects.filter((timelineObject)=>timelineObject.timelineId === selectedTimelineSegment.timeline_id).forEach((timelineObject) => {
            
            timelineObject.selected({selected:false, segment:selectedTimelineSegment})
          })
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
      // let id = this.segmentMenu.selected;
      this.annotationDialogShow=true;
      // this.$emit("annotateSegment", id);
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
  computed: {
    duration() {
      let duration = this.playerStore.videoDuration;
      return duration;
    },
    isLoading() {
      let isLoading = this.videoStore.isLoading;
      return isLoading;
    },
    startTime() {
      let start = this.playerStore.selectedTimeRange.start;
      return start;
    },
    endTime() {
      let end = this.playerStore.selectedTimeRange.end;
      return end;
    },
    timelines() {
      let timelines = this.timelineStore.all;
      return timelines;
    },
    selectedTimelineSegments(){
      return this.timelineSegmentStore.selected;
    },
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

    ...mapStores(useTimelineStore, usePlayerStore, useVideoStore, useTimelineSegmentStore),
  },
  watch: {
    isLoading(newValue, oldValue) {
      if (newValue === false) {
        this.draw();
      }
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
    },
    // time(value) {
    //   this.timeBarsObjects.forEach((e) => {
    //     e.time = value;
    //   });
    // },
    selectedTimelineSegments(newSelection, oldSelection) {

      this.removeSelection(oldSelection);
      this.drawSelection(newSelection);
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

      this.timelineObjects.forEach((e) => {
        e.startTime = this.startTime;
      });
      this.timeScaleObjects.forEach((e) => {
        e.startTime = this.startTime;
      });
      this.timeBarsObjects.forEach((e) => {
        e.startTime = this.startTime;
      });
      this.timelineObjects.forEach((e) => {
        e.endTime = this.endTime;
      });
      this.timeScaleObjects.forEach((e) => {
        e.endTime = this.endTime;
      });
      this.timeBarsObjects.forEach((e) => {
        e.endTime = this.endTime;
      });

      this.timeBarsObjects.forEach((e) => {
        e.time = this.time;
      });
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
    ModalTimelineSegmentAnnotate,
  },
};
</script>

<style>
.draggable-placeholder-inner {
  border: 1px solid #ae1313;
  background: #ae131377;
}
</style>