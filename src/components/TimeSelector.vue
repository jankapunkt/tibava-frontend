<template>
  <canvas :style="{ height: height, width: width }" ref="canvas" resize>
  </canvas>
</template>

<script>
import TimeMixin from "../mixins/time";
import paper from "paper";
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export default {
  mixins: [TimeMixin],
  props: ["duration", "height", "width"],
  data() {
    return {
      canvas: null,
      scope: null,
      tool: null,
      redraw: false,

      selectionStartTime: 10,
      selectionEndTime: 29,

      mainStrokes: null,
      otherStrokes: null,
      textGroup: null,
      // scaleHeight: 50,
      // foregroundColor: "rgba(255,255, 255, 1)",
      // selectionColor: "rgba(230, 57, 70, 0.5)",
      // textColor: "rgba(230, 57, 70, 1)",
    };
  },
  methods: {
    draw() {
      this.canvasWidth = this.scope.view.size.width;
      this.canvasHeight = this.scope.view.size.height;

      this.timeScale = this.scope.view.size.width / this.duration;
      if (isNaN(this.timeScale)) {
        return;
      }

      this.tool = new paper.Tool();

      this.drawScale();
      this.drawSelection();
      // // Create a Paper.js Path to draw a line into it:
      // var path = new paper.Path();
      // // Give the stroke a color
      // path.strokeColor = "black";
      // var start = new paper.Point(100, 100);
      // // Move to start and draw a line from there
      // path.moveTo(start);
      // // Note that the plus operator on Point objects does not work
      // // in JavaScript. Instead, we need to call the add() function:
      // path.lineTo(start.add([200, -50]));
      // // Draw the view now:
      // console.log(paper.view.size);
      // paper.view.onFrame = function (event) {
      //   // On each frame, rotate the path by 3 degrees:
      //   path.rotate(1);
      // };
      this.scope.view.draw();
    },
    // draw() {
    //   this.canvas = this.$refs.canvas;
    //   this.ctx = this.canvas.getContext("2d");
    //   this.ctx.save();

    //   this.width = this.$refs.canvas.parentElement.clientWidth;
    //   this.height = this.$refs.canvas.parentElement.clientHeight;
    //   this.$refs.canvas.width = this.$refs.canvas.parentElement.clientWidth;
    //   this.$refs.canvas.height = this.$refs.canvas.parentElement.clientHeight;

    //   // this.clearRect(0, 0, this.width, this.height);
    //   this.drawScale();
    //   this.draw_selection();
    // },

    // draw_selection() {
    //   this.ctx.save();
    //   this.ctx.fillStyle = this.selectionColor;
    //   this.ctx.strokeStyle = this.selectionColor;
    //   this.ctx.fillRect(
    //     this.timeToX(this.selectionStartTime),
    //     this.pad_y,
    //     this.timeToX(this.selectionEndTime) -
    //       this.timeToX(this.selectionStartTime),
    //     this.scaleHeight
    //   );
    //   this.ctx.stroke();

    //   this.ctx.restore();
    // },

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
      let radius = new paper.Size(5, 5);
      let path = new paper.Path.Rectangle(rectangle, radius);
      path.fillColor = "#ae131377";

      //handle
      let handleRadius = new paper.Size(5, 5);
      let handleLeftRect = new paper.Rectangle(
        new paper.Point(this.timeToX(this.selectionStartTime) - 5, 10),
        new paper.Point(
          this.timeToX(this.selectionStartTime) + 5,
          this.canvasHeight - 10
        )
      );
      let handleLeft = new paper.Path.Rectangle(handleLeftRect, handleRadius);
      handleLeft.fillColor = "#ae1313ff";

      let handleRightRect = new paper.Rectangle(
        new paper.Point(this.timeToX(this.selectionEndTime) - 5, 10),
        new paper.Point(
          this.timeToX(this.selectionEndTime) + 5,
          this.canvasHeight - 10
        )
      );
      let handleRight = new paper.Path.Rectangle(handleRightRect, handleRadius);
      handleRight.fillColor = "#ae1313ff";

      let self = this;
      handleLeft.onMouseDrag = (event) => {
        let deltaTime = self.xToTime(event.delta.x);

        if (
          self.selectionStartTime >= self.selectionEndTime - 1.0 &&
          deltaTime > 0
        ) {
          self.selectionStartTime = self.selectionEndTime - 1.0;
        } else if (self.selectionStartTime <= 0 && deltaTime < 0) {
          self.selectionStartTime = 0;
        } else {
          self.selectionStartTime += deltaTime;
          path.segments[0].point.x += event.delta.x;
          path.segments[1].point.x += event.delta.x;
          path.segments[2].point.x += event.delta.x;
          path.segments[3].point.x += event.delta.x;
          handleLeft.position.x += event.delta.x;
        }
      };

      handleRight.onMouseDrag = (event) => {
        let deltaTime = self.xToTime(event.delta.x);

        if (
          self.selectionEndTime <= self.selectionStartTime + 1.0 &&
          deltaTime < 0
        ) {
          self.selectionEndTime = self.selectionStartTime + 1.0;
        } else if (self.selectionEndTime >= self.duration && deltaTime > 0) {
          self.selectionEndTime = self.duration;
        } else {
          self.selectionEndTime += deltaTime;
          path.segments[4].point.x += event.delta.x;
          path.segments[5].point.x += event.delta.x;
          path.segments[6].point.x += event.delta.x;
          path.segments[7].point.x += event.delta.x;
          handleRight.position.x += event.delta.x;
        }
      };

      path.onMouseDrag = (event) => {
        let deltaTime = self.xToTime(event.delta.x);
        if (self.selectionEndTime >= self.duration && deltaTime > 0) {
          self.selectionEndTime = self.duration;
        } else if (self.selectionStartTime <= 0 && deltaTime < 0) {
          self.selectionStartTime = 0;
        } else {
          self.selectionEndTime += deltaTime;
          self.selectionStartTime += deltaTime;
          path.position.x += event.delta.x;
          handleLeft.position.x += event.delta.x;
          handleRight.position.x += event.delta.x;
        }
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
    // // map time to x and x to time
    timeToX(time) {
      return this.timeScale * time;
    },
    xToTime(x) {
      return x / this.timeScale;
    },
    onResize() {
      this.draw();
    },
  },
  watch: {
    duration() {
      this.draw();
      // this.endTime = this.video.meta.duration;
      // this.draw();
    },
    time() {
      this.draw();
    },
  },
  computed: {},
  mounted() {
    this.canvas = this.$refs.canvas;

    this.scope = new paper.PaperScope();
    this.scope.setup(this.canvas);

    let self = this;
    this.scope.view.onResize = (event) => {
      clearTimeout(self.redraw);
      self.doit = setTimeout(self.onResize(), 100);
    };

    this.draw();
  },
};
</script>