<template>
  <canvas
    ref="canvas"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
    @mouseleave="onMouseUp"
    @click="onMouseClick"
    v-click-outside="clickOutside"
  >
  </canvas>
</template>

<script>
import TimeMixin from "../mixins/time";

export default {
  mixins: [TimeMixin],
  props: ["video"],
  data() {
    return {
      scale: 60,
      startTime: 0,
      endTime: 30,
      selectionStartTime: 10,
      selectionEndTime: 29,
      scaleHeight: 50,
      width: 0,
      foregroundColor: "rgba(255,255, 255, 1)",
      selectionColor: "rgba(230, 57, 70, 0.5)",
      textColor: "rgba(230, 57, 70, 1)",
      pad_y: 15,
      pad_x: 20,
      gap: 5,

      mouse: {
        start: null,
        down: null,
      },

      menu: {
        show: false,
        x: null,
        y: null,
      },
    };
  },
  methods: {
    draw() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext("2d");
      this.ctx.save();

      this.width = this.$refs.canvas.parentElement.clientWidth;
      this.height = this.$refs.canvas.parentElement.clientHeight;
      this.timeScale =
        (this.width - 2 * this.pad_x) / (this.endTime - this.startTime);
      this.$refs.canvas.width = this.$refs.canvas.parentElement.clientWidth;
      this.$refs.canvas.height = this.$refs.canvas.parentElement.clientHeight;

      // this.clearRect(0, 0, this.width, this.height);
      this.draw_scale();
      this.draw_selection();
    },

    draw_selection() {
      this.ctx.save();
      this.ctx.fillStyle = this.selectionColor;
      this.ctx.strokeStyle = this.selectionColor;
      this.ctx.fillRect(
        this.timeToX(this.selectionStartTime),
        this.pad_y,
        this.timeToX(this.selectionEndTime) -
          this.timeToX(this.selectionStartTime),
        this.scaleHeight
      );
      this.ctx.stroke();

      this.ctx.restore();
    },

    draw_scale() {
      this.ctx.save();
      let numberOfTime = 15;
      let shiftY = this.scaleHeight - this.pad_y;
      let that = this;
      let timestemps = this.linspace(
        this.startTime,
        this.endTime,
        numberOfTime
      );

      timestemps.pop();
      timestemps.forEach(function (time, index) {
        that.ctx.font = "12px serif";
        that.ctx.textAlign = "left";
        that.ctx.fillStyle = "black";
        that.ctx.fillText(
          that.get_timecode(time, 2),
          that.timeToX(time),
          shiftY
        );

        that.ctx.beginPath();
        that.ctx.lineWidth = 0.5;
        that.ctx.strokeStyle = "black";
        that.ctx.moveTo(that.timeToX(time), shiftY + 5);
        that.ctx.lineTo(that.timeToX(time), shiftY + 20);
        that.ctx.stroke();
        that.ctx.closePath();
      });

      let smalltimestemps = this.linspace(
        this.startTime,
        this.endTime,
        10 * numberOfTime - 1
      );
      smalltimestemps.forEach(function (time, index) {
        that.ctx.beginPath();
        that.ctx.lineWidth = 0.5;
        that.ctx.strokeStyle = "black";
        that.ctx.moveTo(that.timeToX(time), shiftY + 15);
        that.ctx.lineTo(that.timeToX(time), shiftY + 20);
        that.ctx.stroke();
        that.ctx.closePath();
      });
      this.ctx.restore();
    },

    linspace(startValue, stopValue, cardinality) {
      var arr = [];
      var step = (stopValue - startValue) / (cardinality - 1);
      for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + step * i);
      }
      return arr;
    },
    // map time to x and x to time
    timeToX(time) {
      return this.timeScale * (time - this.startTime) + this.pad_x;
    },
    xToTime(x) {
      return (x - this.pad_x) / this.timeScale + this.startTime;
      // return this.timeScale * (time - this.startTime) + this.pad;
    },
    contains(rect, pos) {
      return (
        rect.x <= pos.x &&
        pos.x <= rect.x + rect.width &&
        rect.y <= pos.y &&
        pos.y <= rect.y + rect.height
      );
    },
    // mouse operators
    clickOutside() {},

    onMouseClick(evt) {
      evt.preventDefault();
      let mouse_pos = this.mousePos(evt);
      let time = this.xToTime(mouse_pos.x);
      let diffStart = Math.abs(time - this.selectionStartTime);
      let endStart = Math.abs(time - this.selectionEndTime);
      if (diffStart < endStart) {
        this.selectionStartTime = time;
        this.$emit("startTimeChange", time);
        this.draw();
      } else {
        this.selectionEndTime = time;
        this.$emit("endTimeChange", time);
        this.draw();
      }
    },
    onMouseDown(evt) {
      // evt.preventDefault();
      // this.mouse.start = this.mousePos(evt);
      // this.mouse.down = true;
      // this.menu.show = false;
      // if (this.ctx) {
      //   this.$el.style.cursor = "crosshair";
      //   this.drawDefaultRect();
      // }
    },
    onMouseUp(evt) {
      // if (this.ctx && this.mouse.down) {
      //   this.mouse.down = false;
      //   this.$el.style.cursor = "default";
      //   const rect = this.computeRect(this.mouse.start, this.mousePos(evt));
      //   // region of interest is too small
      //   if (rect.width * rect.height < 20) {
      //     this.ctx.clearRect(0, 0, this.image.width, this.image.height);
      //     this.$emit("update", null);
      //     return;
      //   }
      //   this.setROI(rect, false);
      //   this.drawROI();
      //   this.$emit("update", this.roi);
      //   this.menu = {
      //     show: false,
      //     x: evt.clientX,
      //     y: evt.clientY,
      //   };
      //   this.$nextTick(() => {
      //     this.menu.show = true;
      //   });
      // }
    },
    onMouseMove(evt) {
      // if (this.ctx && this.mouse.down) {
      //   const rect = this.computeRect(this.mouse.start, this.mousePos(evt));
      //   this.setROI(rect, false);
      //   this.drawROI();
      // }
    },
    mousePos({ clientX, clientY }) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
  },
  watch: {
    video() {
      this.endTime = this.video.meta.duration;
      this.draw();
    },
    time() {
      this.draw();
    },
  },
  computed: {},
  mounted() {
    this.draw();
  },
};
</script>