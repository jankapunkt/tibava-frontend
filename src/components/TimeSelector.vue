<template>
  <div ref="container" style="width: 100%">
    <canvas :style="canvasStyle" ref="canvas" resize> </canvas>
  </div>
</template>

<script>
import TimeMixin from "../mixins/time";
import paper from "paper";
export default {
  mixins: [TimeMixin],
  props: {
    duration: {},
    width: {
      default: "100%",
    },
    height: {
      default: "60",
    },
    radius: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      canvasStyle: {
        height: this.height,
        width: this.width,
      },
      canvasWidth: null,
      canvasHeight: null,
      containerWidth: null,
      containerHeight: null,

      canvas: null,
      scope: null,
      tool: null,
      redraw: false,

      selectionStartTime: 0,
      selectionEndTime: this.duration,
      minTime: 1.0,

      mainStrokes: null,
      otherStrokes: null,
      textGroup: null,

      handleGroup: null,
      handleLeft: null,
      handleRight: null,
      handleBar: null,
    };
  },
  methods: {
    draw() {
      this.canvas.height = this.height;
      var desiredWidth = this.$refs.container.clientWidth; // For instance: $(window).width();

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
      this.timeScale = this.scope.view.size.width / this.duration;
      if (isNaN(this.timeScale)) {
        return;
      }

      this.tool = new paper.Tool();

      this.drawScale();
      this.drawSelection();
      this.scope.view.draw();
    },

    drawScale() {
      if (this.scaleLayer) {
        this.scaleLayer.removeChildren();
      }
      this.scope.activate();
      this.scaleLayer = new paper.Layer();
      let numberOfMainTime = 9;
      let numberOfOtherTime = 10 * (numberOfMainTime - 1) + 1;
      let timestemps = this.linspace(0, this.duration, numberOfMainTime);
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

      let otherTimestemps = this.linspace(0, this.duration, numberOfOtherTime);
      let otherStrokes = [];
      otherTimestemps.forEach((time, index) => {
        let path = new paper.Path();

        let x = this.timeToX(time);
        path.add(new paper.Point(x, 25), new paper.Point(x, 30));
        otherStrokes.push(path);
      });
      this.otherStrokes = new paper.Group(otherStrokes);
      this.otherStrokes.strokeColor = "black";
    },

    drawSelection() {
      if (this.selectionLayer) {
        this.selectionLayer.removeChildren();
      }
      this.scope.activate();
      this.selectionLayer = new paper.Layer();
      let rectangle = new paper.Rectangle(
        new paper.Point(this.timeToX(this.selectionStartTime), 5),
        new paper.Point(
          this.timeToX(this.selectionEndTime),
          this.canvasHeight - 5
        )
      );
      let radius = new paper.Size(this.radius, this.radius);
      let path = new paper.Path.Rectangle(rectangle, radius);
      path.fillColor = "#ae131377";

      this.handleBar = path;

      //handle
      let handleRadius = new paper.Size(this.radius, this.radius);
      let handleLeftRect = new paper.Rectangle(
        new paper.Point(this.timeToX(this.selectionStartTime) - 5, 10),
        new paper.Point(
          this.timeToX(this.selectionStartTime) + 5,
          this.canvasHeight - 10
        )
      );
      let handleLeft = new paper.Path.Rectangle(handleLeftRect, handleRadius);
      handleLeft.fillColor = "#ae1313ff";

      this.handleLeft = handleLeft;

      let handleRightRect = new paper.Rectangle(
        new paper.Point(this.timeToX(this.selectionEndTime) - 5, 10),
        new paper.Point(
          this.timeToX(this.selectionEndTime) + 5,
          this.canvasHeight - 10
        )
      );
      let handleRight = new paper.Path.Rectangle(handleRightRect, handleRadius);
      handleRight.fillColor = "#ae1313ff";

      this.handleRight = handleRight;
      this.handleGroup = new paper.Group([path, handleLeft, handleRight]);

      let self = this;
      handleLeft.onMouseDrag = (event) => {
        let deltaTime = self.xToTime(event.delta.x);

        if (deltaTime > 0) {
          self.selectionStartTime = Math.min(
            self.selectionStartTime + deltaTime,
            self.selectionEndTime - self.minTime
          );
        } else {
          self.selectionStartTime = Math.max(
            self.selectionStartTime + deltaTime,
            0
          );
        }
        self.onSelectionChange();
      };

      handleRight.onMouseDrag = (event) => {
        let deltaTime = self.xToTime(event.delta.x);

        if (deltaTime < 0) {
          self.selectionEndTime = Math.max(
            self.selectionEndTime + deltaTime,
            self.selectionStartTime + self.minTime
          );
        } else {
          self.selectionEndTime = Math.min(
            self.selectionEndTime + deltaTime,
            self.duration
          );
        }
        self.onSelectionChange();
      };

      path.onMouseDrag = (event) => {
        //timespan should be const
        const timeSpan = self.selectionEndTime - self.selectionStartTime;
        let deltaTime = self.xToTime(event.delta.x);
        if (deltaTime > 0) {
          self.selectionEndTime = Math.min(
            self.selectionEndTime + deltaTime,
            self.duration
          );
          self.selectionStartTime = self.selectionEndTime - timeSpan;
        } else {
          self.selectionStartTime = Math.max(
            self.selectionStartTime + deltaTime,
            0
          );
          self.selectionEndTime = self.selectionStartTime + timeSpan;
        }
        self.onSelectionChange();
      };
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
      return this.timeScale * time;
    },
    xToTime(x) {
      return x / this.timeScale;
    },
    // some event handler
    onResize(event) {
      this.$nextTick(() => {
        this.draw();
      });
    },
    onSelectionChange() {
      let posStart = this.timeToX(this.selectionStartTime);
      let posEnd = this.timeToX(this.selectionEndTime);
      let timeSpan = posEnd - posStart;
      this.handleLeft.position.x = posStart;
      this.handleRight.position.x = posEnd;
      this.handleBar.segments[0].point.x = posStart + this.radius;
      this.handleBar.segments[1].point.x = posStart;
      this.handleBar.segments[2].point.x = posStart;
      this.handleBar.segments[3].point.x = posStart + this.radius;

      this.handleBar.segments[4].point.x = posEnd - this.radius;
      this.handleBar.segments[5].point.x = posEnd;
      this.handleBar.segments[6].point.x = posEnd;
      this.handleBar.segments[7].point.x = posEnd - this.radius;
    },
  },
  watch: {
    duration() {
      this.selectionStartTime = 0;
      this.selectionEndTime = this.duration;
      this.draw();
    },
    selectionStartTime() {
      this.$emit("startTimeChange", this.selectionStartTime);
    },
    selectionEndTime() {
      this.$emit("endTimeChange", this.selectionEndTime);
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
        self.doit = setTimeout(self.onResize(), 100);
      }
    };

    this.scope.view.onResize = (event) => {
      clearTimeout(self.redraw);
      self.doit = setTimeout(self.onResize(), 100);
    };

    this.draw();
  },
};
</script>
