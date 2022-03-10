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
            Duplicate
          </v-list-item-title>
        </v-list-item>
        <v-list-item link v-on:click="onRenameTimeline">
          <v-list-item-title>
            <v-icon left>{{ "mdi-pencil" }}</v-icon>
            Rename
          </v-list-item-title>
        </v-list-item>
        <v-list-item link v-on:click="onDeleteTimeline">
          <v-list-item-title>
            <v-icon left>{{ "mdi-delete" }}</v-icon>
            Delete
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
import paper from "paper";

export default {
  mixins: [TimeMixin],
  props: {
    time: {
      type: Number,
    },
    timelines: {},
    startTime: {
      type: Number,
    },
    endTime: {
      type: Number,
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
      if (this.timelines) {
        this.canvas.height =
          this.scaleHeight +
          this.timelines.length * (this.timelineHeight + this.gap);
      } else {
        this.canvas.height = 80;
      }

      var desiredWidth = this.$refs.container.clientWidth; // For instance: $(window).width();
      // var desiredHeight = h; // For instance $('#canvasContainer').height();

      this.containerWidth = this.$refs.container.clientWidth;
      this.containerHeight = this.$refs.container.clientHeight;
      this.canvas.width = desiredWidth;

      this.scope.view.viewSize = new paper.Size(
        this.canvas.width,
        this.canvas.height
      );
      this.scope.view.draw();

      this.canvasWidth = this.scope.view.size.width;
      this.canvasHeight = this.scope.view.size.height;
      this.timeScale =
        (this.scope.view.size.width - this.headerWidth - 5 * this.gap) /
        (this.endTime - this.startTime);
      if (isNaN(this.timeScale)) {
        return;
      }
      this.drawScale();
      this.drawTimelineHeader();
      this.drawTimeline();
      this.drawSegment();
      this.drawTime();
      this.drawSelection(this.selectedTimelineSegment);

      this.scope.view.draw();
    },
    drawScale() {
      this.scope.activate();
      if (this.scaleLayer) {
        this.scaleLayer.removeChildren();
      }
      this.scaleLayer = new paper.Layer();
      this.scaleLayer.activate();
      let numberOfMainTime = 9;
      let numberOfOtherTime = 10 * (numberOfMainTime - 1) + 1;

      let timestemps = this.linspace(
        this.startTime,
        this.endTime,
        numberOfMainTime
      );
      let mainStrokes = [];
      timestemps.forEach((time, index) => {
        let path = new paper.Path();

        let x = this.timeToX(time);
        path.add(new paper.Point(x, 10), new paper.Point(x, 35));
        mainStrokes.push(path);
      });
      this.mainStrokes = new paper.Group(mainStrokes);
      this.mainStrokes.strokeColor = "black";
      this.mainStrokes.strokeWidth = 2;

      timestemps.pop();
      let textList = [];
      timestemps.forEach((time, index) => {
        let x = this.timeToX(time);
        let text = new paper.PointText(new paper.Point(x, 50));
        text.content = this.get_timecode(time, 2);
        textList.push(text);
      });
      this.textGroup = new paper.Group(textList);
      this.textGroup.style = {
        fontFamily: "Courier New",

        fontSize: 10,
        fillColor: "black",
      };

      let otherTimestemps = this.linspace(
        this.startTime,
        this.endTime,
        numberOfOtherTime
      );
      let otherStrokes = [];
      otherTimestemps.forEach((time, index) => {
        let path = new paper.Path();

        let x = this.timeToX(time);
        path.add(new paper.Point(x, 25), new paper.Point(x, 30));
        otherStrokes.push(path);
      });
      this.otherStrokes = new paper.Group(otherStrokes);
      this.otherStrokes.strokeColor = "black";

      let actionRectangle = new paper.Rectangle(
        new paper.Point(this.timeToX(0), 0),
        new paper.Point(this.timeToX(this.endTime), this.scaleHeight)
      );
      let actionPath = new paper.Path.Rectangle(actionRectangle);
      // TODO
      actionPath.fillColor = "#00000001";
      actionPath.onClick = (event) => {
        this.$emit("update:time", this.xToTime(event.point.x));
      };
    },
    drawTimelineHeader() {
      this.scope.activate();
      if (this.headerLayer) {
        this.headerLayer.removeChildren();
      }

      this.headerLayer = new paper.Layer();

      this.headerLayer.activate();

      let self = this;
      this.timelines.forEach((e, i) => {
        //box
        let rectangle = new paper.Rectangle(
          new paper.Point(
            this.gap,
            (this.gap + this.timelineHeight) * i + this.scaleHeight
          ),
          new paper.Point(
            this.gap + this.headerWidth,
            (this.gap + this.timelineHeight) * i +
              this.scaleHeight +
              this.timelineHeight
          )
        );
        let radius = new paper.Size(this.radius, this.radius);
        let path = new paper.Path.Rectangle(rectangle, radius);
        path.style = self.headerStyle;

        //text
        var text = new paper.PointText(
          new paper.Point(
            3 * this.gap,
            (this.gap + this.timelineHeight) * i + this.scaleHeight + 20 //todo move this
          )
        );

        text.justification = "left";
        text.fillColor = "black";
        text.content = e.name;
        path.onClick = (event) => {
          let canvasRect = self.canvas.getBoundingClientRect();
          self.timelineMenu.show = true;
          self.timelineMenu.x = event.point.x + canvasRect.x;
          self.timelineMenu.y = event.point.y + canvasRect.y;
          self.timelineMenu.selected = e.id;
          self.$nextTick(() => {
            self.showMenu = true;
          });
        };
      });
    },
    drawTimeline() {
      this.scope.activate();
      if (this.timelineLayer) {
        this.timelineLayer.removeChildren();
      }

      this.timelineLayer = new paper.Layer();

      this.timelineLayer.activate();

      let self = this;
      this.timelines.forEach((e, i) => {
        //box
        let rectangle = new paper.Rectangle(
          new paper.Point(
            self.timeToX(self.startTime),
            (this.gap + this.timelineHeight) * i + this.scaleHeight
          ),
          new paper.Point(
            self.timeToX(self.endTime),
            (this.gap + this.timelineHeight) * i +
              this.scaleHeight +
              this.timelineHeight
          )
        );
        let radius = new paper.Size(this.radius, this.radius);
        let path = new paper.Path.Rectangle(rectangle, radius);
        path.style = self.timelineStyle;

        // path.onClick = (event) => {
        //   let canvasRect = self.canvas.getBoundingClientRect();
        //   self.timelineMenu.show = true;
        //   self.timelineMenu.x = event.point.x + canvasRect.x;
        //   self.timelineMenu.y = event.point.y + canvasRect.y;
        //   self.timelineMenu.selected = e.id;
        //   self.$nextTick(() => {
        //     self.showMenu = true;
        //   });
        // };
      });
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
    linspace(startValue, stopValue, cardinality) {
      var arr = [];
      var step = (stopValue - startValue) / (cardinality - 1);
      for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + step * i);
      }
      return arr;
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
    startTime() {
      this.draw();
    },
    endTime() {
      this.draw();
    },
    timelines() {
      this.draw();
    },
    time() {
      this.drawTime();
      this.targetTime = this.time;
    },
    selectedTimelineSegment(newSelection, oldSelection) {
      this.removeSelection(oldSelection);
      this.drawSelection(newSelection);
    },
  },
  computed: {},
  mounted() {
    this.canvas = this.$refs.canvas;

    this.scope = new paper.PaperScope();
    this.scope.setup(this.canvas);

    let self = this;
    this.scope.view.onFrame = (event) => {
      if (
        self.$refs.container.clientWidth !== self.containerWidth ||
        self.$refs.container.clientHeight !== self.containerHeight
      ) {
        clearTimeout(self.redraw);
        self.redraw = setTimeout(self.onResize(), 100);
      }
    };

    this.scope.view.onResize = (event) => {
      clearTimeout(self.redraw);
      self.redraw = setTimeout(self.onResize(), 100);
    };

    this.draw();
  },
};
</script>
