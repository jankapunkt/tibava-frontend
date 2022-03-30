<template>
  <div ref="container" style="width: 100%">
    <canvas :style="canvasStyle" ref="canvas" resize> </canvas>
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
            {{ $t("timline.duplicate") }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item link v-on:click="onRenameTimeline">
          <v-list-item-title>
            <v-icon left>{{ "mdi-pencil" }}</v-icon>
            {{ $t("timline.rename") }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item link v-on:click="onDeleteTimeline">
          <v-list-item-title>
            <v-icon left>{{ "mdi-delete" }}</v-icon>
            {{ $t("timline.delete") }}
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
        <v-list-item link v-on:click="onColoringSegment">
          <v-list-item-title>
            <v-icon left>{{ "mdi-pencil" }}</v-icon>
            {{ $t("timelineSegment.color") }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item link v-on:click="onDeleteSegment">
          <v-list-item-title>
            <v-icon left>{{ "mdi-delete" }}</v-icon>
            {{ $t("timelineSegment.delete") }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import TimeMixin from "../mixins/time";
import { AnnotationTimeline, TimelineHeader, TimeScale } from "../plugins/draw";
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
      default: 200,
    },
    scaleHeight: {
      type: Number,
      default: 60,
    },
    timelineHeight: {
      type: Number,
      default: 80,
    },
    gap: {
      type: Number,
      default: 4,
    },
    radius: {
      default: 5,
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
      timelinesContainer: null,
      timelineObjects: [],
      timeScaleObjects: [],

      canvasStyle: {
        height: this.scaleHeight,
        width: this.width,
      },

      canvasWidth: null,
      canvasHeight: null,
      containerWidth: null,
      containerHeight: null,

      canvas: null,
      scope: null,

      // Groups
      scaleGroup: null,
      mainStrokes: null,
      otherStrokes: null,
      textGroup: null,

      // Layers
      scaleLayer: null,
      headerLayer: null,

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
        (window.innerWidth - this.headerWidth - 5 * this.gap) /
        (this.endTime - this.startTime);
      this.drawTimeline();
      this.drawTimelineHeader();
      this.drawScale();
    },
    // draw() {
    //   if (this.timelines) {
    //     this.canvas.height =
    //       this.scaleHeight +
    //       this.timelines.length * (this.timelineHeight + this.gap);
    //   } else {
    //     this.canvas.height = 80;
    //   }

    //   var desiredWidth = this.$refs.container.clientWidth; // For instance: $(window).width();
    //   // var desiredHeight = h; // For instance $('#canvasContainer').height();

    //   this.containerWidth = this.$refs.container.clientWidth;
    //   this.containerHeight = this.$refs.container.clientHeight;
    //   this.canvas.width = desiredWidth;

    //   this.scope.view.viewSize = new paper.Size(
    //     this.canvas.width,
    //     this.canvas.height
    //   );
    //   this.scope.view.draw();

    //   this.canvasWidth = this.scope.view.size.width;
    //   this.canvasHeight = this.scope.view.size.height;
    //   this.timeScale =
    //     (this.scope.view.size.width - this.headerWidth - 5 * this.gap) /
    //     (this.endTime - this.startTime);
    //   if (isNaN(this.timeScale)) {
    //     return;
    //   }
    //   this.drawScale();
    //   this.drawTimelineHeader();
    // this.drawTimeline();
    //   this.drawSegment();
    //   this.drawTime();
    //   this.drawSelection(this.selectedTimelineSegment);

    //   this.scope.view.draw();
    // },
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

      // this.scope.activate();
      // if (this.scaleLayer) {
      //   this.scaleLayer.removeChildren();
      // }
      // this.scaleLayer = new paper.Layer();
      // this.scaleLayer.activate();
      // let numberOfMainTime = 9;
      // let numberOfOtherTime = 10 * (numberOfMainTime - 1) + 1;

      // let timestemps = this.linspace(
      //   this.startTime,
      //   this.endTime,
      //   numberOfMainTime
      // );
      // let mainStrokes = [];
      // timestemps.forEach((time, index) => {
      //   let path = new paper.Path();

      //   let x = this.timeToX(time);
      //   path.add(new paper.Point(x, 10), new paper.Point(x, 35));
      //   mainStrokes.push(path);
      // });
      // this.mainStrokes = new paper.Group(mainStrokes);
      // this.mainStrokes.strokeColor = "black";
      // this.mainStrokes.strokeWidth = 2;

      // timestemps.pop();
      // let textList = [];
      // timestemps.forEach((time, index) => {
      //   let x = this.timeToX(time);
      //   let text = new paper.PointText(new paper.Point(x, 50));
      //   text.content = this.get_timecode(time, 2);
      //   textList.push(text);
      // });
      // this.textGroup = new paper.Group(textList);
      // this.textGroup.style = {
      //   fontFamily: "Courier New",

      //   fontSize: 10,
      //   fillColor: "black",
      // };

      // let otherTimestemps = this.linspace(
      //   this.startTime,
      //   this.endTime,
      //   numberOfOtherTime
      // );
      // let otherStrokes = [];
      // otherTimestemps.forEach((time, index) => {
      //   let path = new paper.Path();

      //   let x = this.timeToX(time);
      //   path.add(new paper.Point(x, 25), new paper.Point(x, 30));
      //   otherStrokes.push(path);
      // });
      // this.otherStrokes = new paper.Group(otherStrokes);
      // this.otherStrokes.strokeColor = "black";

      // let actionRectangle = new paper.Rectangle(
      //   new paper.Point(this.timeToX(0), 0),
      //   new paper.Point(this.timeToX(this.endTime), this.scaleHeight)
      // );
      // let actionPath = new paper.Path.Rectangle(actionRectangle);
      // // TODO
      // actionPath.fillColor = "#00000001";
      // actionPath.onClick = (event) => {
      //   this.$emit("update:time", this.xToTime(event.point.x));
      // };
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
        this.timelinesContainer.addChild(timeline);
        this.timelineObjects.push(timeline);
      });
      this.app.stage.addChild(this.timelinesContainer);
    },
    drawSegment() {
      this.scope.activate();
      if (this.segmentLayer) {
        this.segmentLayer.removeChildren();
      }

      this.segmentLayer = new paper.Layer();

      this.segmentLayer.activate();

      this.timelineSegments = [];

      let self = this;
      this.timelines.forEach((e, i) => {
        var segmentList = [];
        let timeline = e;
        timeline.segments.forEach((s, j) => {
          //box
          let start = Math.max(
            self.timeToX(s.start),
            self.timeToX(self.startTime)
          );
          let end = Math.min(self.timeToX(s.end), self.timeToX(self.endTime));

          if (end < start) {
            segmentList.push(null);
            return;
          }

          let rectangle = new paper.Rectangle(
            new paper.Point(
              start,
              (this.gap + this.timelineHeight) * i + this.scaleHeight + 1
            ),
            new paper.Point(
              end,
              (this.gap + this.timelineHeight) * i +
                this.scaleHeight +
                this.timelineHeight -
                1
            )
          );
          let radius = new paper.Size(this.radius, this.radius);
          let path = new paper.Path.Rectangle(rectangle, radius);
          path.style = self.segmentStyle;
          path.fillColor = s.color;
          segmentList.push({
            path: path,
            id: s.id,
            start: s.start,
            end: s.end,
          });

          path.onClick = (event) => {
            console.log(event);
            if (event.event.ctrlKey) {
              self.$emit("addSelection", { timeline: i, segment: j });
            } else {
              self.$emit("select", { timeline: i, segment: j });
            }
            let canvasRect = self.canvas.getBoundingClientRect();
            self.segmentMenu.show = true;
            self.segmentMenu.x = event.point.x + canvasRect.x;
            self.segmentMenu.y = event.point.y + canvasRect.y;
            self.segmentMenu.selected = s.id;
            self.$nextTick(() => {
              self.showMenu = true;
            });
          };
          let annotationTexts = [path.clone()];
          let annotationBoxes = [path.clone()];
          var annotationStart = start;
          var annotationI = 0;
          var annotationJ = 0;

          // create the text element
          var annotationsRect = [];
          s.annotations.forEach((a, k) => {
            let targetPoint = new paper.Point(
              annotationStart + this.gap,
              (this.gap + this.timelineHeight) * i +
                this.scaleHeight +
                20 * (annotationJ + 1) //todo move this
            );
            var text = new paper.PointText(targetPoint);

            text.justification = "left";
            text.fillColor = "black";
            text.content = a.annotation.name;

            // check if should make a break
            let annoRectangle = text.strokeBounds;
            // 3 is a buffer to prevent some render issues
            annotationStart += annoRectangle.width + 2 * this.gap;
            if (annotationI > 0 && annotationStart > end) {
              annotationJ += 1;

              annotationStart = start;
              text.remove();
              text = new paper.PointText(
                new paper.Point(
                  annotationStart + this.gap,
                  (this.gap + this.timelineHeight) * i +
                    this.scaleHeight +
                    20 * (annotationJ + 1) //todo move this
                )
              );
              text.justification = "left";
              text.fillColor = "black";
              text.content = a.annotation.name;

              annoRectangle = text.strokeBounds;

              annotationStart += annoRectangle.width + 2 * this.gap;
              annotationI = 1;
            } else {
              annotationI += 1;
            }

            // draw badge
            let textBoundingBox = new paper.Path.Rectangle(
              annoRectangle,
              new paper.Size(1, 1)
            );
            textBoundingBox.fillColor = a.annotation.color;
            textBoundingBox.insertBelow(text);

            annotationTexts.push(text);
            annotationBoxes.push(textBoundingBox);
          });
          let annotationTextsGroup = new paper.Group(annotationTexts);
          annotationTextsGroup.clipped = true;
          let annotationBoxesGroup = new paper.Group(annotationBoxes);
          annotationBoxesGroup.clipped = true;
          annotationBoxesGroup.insertBelow(annotationTextsGroup);
        });
        this.timelineSegments.push(segmentList);
      });
    },
    drawTime() {
      this.scope.activate();
      if (this.timeLayer) {
        this.timeLayer.removeChildren();
      }

      this.timeLayer = new paper.Layer();

      this.timeLayer.activate();
      if (this.time < this.startTime || this.time > this.endTime) {
        return;
      }
      let x = this.timeToX(this.time);

      var path = new paper.Path();
      path.strokeColor = "#ae1313ff";

      let handlePad = 5;

      path.fillColor = "#ae131377";
      path.add(new paper.Point(x, this.canvasHeight));
      path.add(new paper.Point(x, 20));
      path.add(new paper.Point(x + handlePad, 20 - 2));
      path.add(new paper.Point(x + handlePad, 5));
      path.add(new paper.Point(x - handlePad, 5));
      path.add(new paper.Point(x - handlePad, 20 - 2));
      path.add(new paper.Point(x, 20));
      let self = this;
      path.onMouseDrag = (event) => {
        const deltaTime = self.deltaXToTime(event.delta.x);
        let nextTime = self.targetTime + deltaTime;
        if (deltaTime > 0) {
          nextTime = Math.min(self.targetTime + deltaTime, self.endTime);
        } else {
          nextTime = Math.max(self.targetTime + deltaTime, self.startTime);
        }

        path.position.x = self.timeToX(nextTime);
        this.targetTime = nextTime;
        this.$emit("update:time", this.targetTime);
      };
    },
    drawSelection(selectedTimelineSegment) {
      if (
        selectedTimelineSegment &&
        selectedTimelineSegment.length > 0 &&
        this.timelineSegments &&
        this.timelineSegments.length > 0
      ) {
        selectedTimelineSegment.forEach((e) => {
          if (
            this.timelineSegments[e.timeline] &&
            this.timelineSegments[e.timeline].length > 0
          ) {
            let segment = this.timelineSegments[e.timeline][e.segment];
            if (segment) {
              segment.path.strokeColor = "#ae1313ff";
            }
          }
        });
      }
    },
    removeSelection(selectedTimelineSegment) {
      if (
        selectedTimelineSegment &&
        selectedTimelineSegment.length > 0 &&
        this.timelineSegments &&
        this.timelineSegments.length > 0
      ) {
        selectedTimelineSegment.forEach((e) => {
          if (
            this.timelineSegments[e.timeline] &&
            this.timelineSegments[e.timeline].length > 0
          ) {
            let segment = this.timelineSegments[e.timeline][e.segment];
            if (segment) {
              segment.path.strokeColor = null;
            }
          }
        });
      }
    },

    //  map time to x and x to time
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
    deltaXToTime(x) {
      return x / this.timeScale;
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
      console.log(id);
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
    },
    endTime(value) {
      this.timelineObjects.forEach((e) => {
        e.endTime = value;
      });
      this.timeScaleObjects.forEach((e) => {
        e.endTime = value;
      });
    },
    timelines() {
      this.draw();
    },
    // time() {
    //   this.drawTime();
    //   this.targetTime = this.time;
    // },
    // selectedTimelineSegment(newSelection, oldSelection) {
    //   this.removeSelection(oldSelection);
    //   this.drawSelection(newSelection);
    // },
  },
  computed: {},
  mounted() {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      transparent: true,
      view: this.$refs.canvas,
    });

    this.$refs.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  },
};
</script>
