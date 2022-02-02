<template>
  <v-container>
    <v-card
      class="d-flex flex-column"
      height="80"
      width="100%"
      max-width="100%"
      elevation="8"
    >
      <v-row>
        <v-col class="timeline-bar">
          <canvas ref="canvas"> </canvas>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
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
      pad_y: 5,
      pad_x: 20,
      gap: 5,
    };
  },
  methods: {
    init() {
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

      let shiftY = this.scaleHeight - 4 * this.pad_y;
      let that = this;
      let timestemps = this.linspace(this.startTime, this.endTime, 15);
      timestemps.forEach(function (time, index) {
        console.log(`a ${that.timeScale} ${that.timeToX(time)} ${time}`);
        that.ctx.font = "16px serif";
        that.ctx.textAlign = "left";
        that.ctx.fillStyle = "black";
        that.ctx.fillText(that.get_timecode(time), that.timeToX(time), shiftY);

        that.ctx.beginPath();
        that.ctx.lineWidth = 0.5;
        that.ctx.strokeStyle = "black";
        that.ctx.moveTo(that.timeToX(time), shiftY + 5);
        that.ctx.lineTo(that.timeToX(time), shiftY + 20);
        that.ctx.stroke();
        that.ctx.closePath();
      });

      let smalltimestemps = this.linspace(this.startTime, this.endTime, 149);
      smalltimestemps.forEach(function (time, index) {
        that.ctx.beginPath();
        that.ctx.lineWidth = 0.5;
        that.ctx.strokeStyle = "black";
        that.ctx.moveTo(that.timeToX(time), shiftY + 15);
        that.ctx.lineTo(that.timeToX(time), shiftY + 20);
        that.ctx.stroke();
        that.ctx.closePath();
      });
      // for (let i = this.startTime; i < this.endTime; i++) {
      //   console.log(`a ${this.timeScale} ${this.timeToX(i)} ${i}`);
      //   this.ctx.font = "16px serif";
      //   this.ctx.textAlign = "left";
      //   this.ctx.fillStyle = "black";
      //   this.ctx.fillText(this.get_timecode(i), this.timeToX(i), shiftY);

      //   this.ctx.beginPath();
      //   this.ctx.lineWidth = 0.5;
      //   this.ctx.strokeStyle = "black";
      //   this.ctx.moveTo(this.timeToX(i + 0.5), shiftY + 15);
      //   this.ctx.lineTo(this.timeToX(i + 0.5), shiftY + 20);
      //   this.ctx.moveTo(this.timeToX(i), shiftY + 5);
      //   this.ctx.lineTo(this.timeToX(i), shiftY + 20);
      //   this.ctx.stroke();
      //   this.ctx.closePath();
      // }
      this.ctx.restore();
    },

    timeToX(time) {
      return this.timeScale * (time - this.startTime) + this.pad_x;
    },
    linspace(startValue, stopValue, cardinality) {
      var arr = [];
      var step = (stopValue - startValue) / (cardinality - 1);
      for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + step * i);
      }
      return arr;
    },
    mouse_pos({ clientX, clientY }) {
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
      this.init();
    },
    time() {
      this.init();
      console.log(this.time);
    },
  },
  computed: {},
  mounted() {
    this.init();
  },
};
</script>


<style>
.timeline-bar {
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 10px;
}
</style>