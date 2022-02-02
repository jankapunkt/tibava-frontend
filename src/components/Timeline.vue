<template>
  <v-container>
    <v-card
      class="d-flex flex-column"
      height="500"
      width="100%"
      max-width="100%"
      elevation="8"
    >
      <v-row>
        <v-col class="timeline-header">
          <v-card
            class="timeline-head"
            v-for="item in timelines"
            :key="item.id"
          >
            {{ item.name }}
          </v-card>
        </v-col>
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
  props: ["video", "time"],
  data() {
    return {
      //pixel per seconds
      context: null,
      scale: 60,
      startTime: 10,
      endTime: 25,
      timelineHeight: 50,
      timelineWidth: 120,
      scaleHeight: 50,
      width: 0,
      foregroundColor: "rgba(255,255, 255, 1)",
      backgroundColor: "rgba(230, 57, 70, 1)",
      textColor: "rgba(230, 57, 70, 1)",
      pad: 5,
      gap: 5,
      timelines: [
        {
          name: "face",
          segments: [
            {
              startTime: 0.2,
              endTime: 14,
              labels: ["foo", "bar"],
              color: "red",
            },
          ],
        },
        {
          name: "shot",
          segments: [],
        },
        {
          name: "shot",
          segments: [],
        },
        {
          name: "shot",
          segments: [],
        },
        {
          name: "shot",
          segments: [],
        },
        {
          name: "shot",
          segments: [],
        },
      ],
    };
  },
  methods: {
    init() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext("2d");

      this.ctx.save();

      this.width = this.$refs.canvas.parentElement.clientWidth;
      this.timeScale =
        (this.width - 2 * this.pad) / (this.endTime - this.startTime);
      this.$refs.canvas.width = this.$refs.canvas.parentElement.clientWidth;
      this.$refs.canvas.height = this.$refs.canvas.parentElement.clientHeight;

      this.draw_scale();
      this.draw_timelines();
      this.drawCurrentTime();
    },

    draw_timelines() {
      this.ctx.save();
      console.log(this.timelines.length);
      for (let i = 0; i < this.timelines.length; i++) {
        this.draw_timeline(
          this.pad,
          this.scaleHeight + this.pad + i * (this.timelineHeight + this.gap),
          this.$refs.canvas.width - 2 * this.pad,
          this.timelineHeight,
          this.timelines[i].segments
        );
      }
      this.ctx.restore();
    },
    draw_timeline(x, y, width, height, segments) {
      this.ctx.shadowColor = "black";
      this.ctx.shadowBlur = 1;

      this.ctx.fillStyle = "white";
      this.ctx.fillRect(x, y, width, height);
      this.ctx.stroke();
      var that = this;
      segments.forEach(function (e) {
        that.ctx.save();
        let start = Math.max(e.startTime, that.startTime);
        let end = Math.min(e.endTime, that.endTime);
        if (end == start) {
          // Nothing to draw
          reutrn;
        }
        console.log(e);

        that.ctx.fillStyle = "red";
        that.ctx.fillRect(
          that.timeToX(start),
          y,
          that.timeToX(end) - that.timeToX(start),
          height
        );
        // that.ctx.clip();
        that.ctx.fillStyle = "black";

        that.ctx.font = "16px serif";
        let text_mid =
          (that.timeToX(end) - that.timeToX(start)) / 2 + that.timeToX(start);
        that.ctx.fillText(e.labels[0], text_mid, y + (height + 16) / 2);
        that.ctx.restore();
      });
    },
    draw_scale() {
      this.ctx.save();

      let shiftY = this.scaleHeight - 4 * this.pad;
      for (let i = this.startTime; i < this.endTime; i++) {
        console.log(
          `Mutate current analyser ${this.timeScale} ${this.timeToX(i)} ${i}`
        );
        this.ctx.font = "16px serif";
        this.ctx.textAlign = "left";
        this.ctx.fillText(this.get_timecode(i), this.timeToX(i), shiftY);

        // this.ctx.beginPath();
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeStyle = "black";
        this.ctx.moveTo(this.timeToX(i + 0.5), shiftY + 15);
        this.ctx.lineTo(this.timeToX(i + 0.5), shiftY + 20);
        this.ctx.moveTo(this.timeToX(i), shiftY + 5);
        this.ctx.lineTo(this.timeToX(i), shiftY + 20);
        this.ctx.stroke();
      }
      this.ctx.restore();
    },
    drawCurrentTime() {
      if (this.time < this.startTime) {
        return;
      }
      if (this.time > this.endTime) {
        return;
      }

      this.ctx.save();

      let shiftY = this.scaleHeight - this.pad;

      // this.ctx.beginPath();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "blue";
      this.ctx.moveTo(this.timeToX(this.time), shiftY + 5);
      this.ctx.lineTo(
        this.timeToX(this.time),
        shiftY +
          this.scaleHeight +
          this.pad +
          (this.timelines.length - 1) * (this.timelineHeight + this.gap)
      );
      this.ctx.stroke();

      this.ctx.restore();
    },

    timeToX(time) {
      return this.timeScale * (time - this.startTime) + this.pad;
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
      // if (this.time < this.startTime) {
      //   return;
      // }
      // if (this.time > this.endTime) {
      //   return;
      // }

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
.timeline-header {
  margin-top: 60px;
  width: 10%;
  max-width: 10%;
  padding: 0;
  margin-left: 10px;
}
.timeline-bar {
  width: 90%;
  max-width: 90%;
  padding: 0;
  margin: 10px;
}
.timeline-head {
  height: 50px;
  margin-left: 5px;
  margin-top: 5px;
  margin-right: 00px;
  padding: 2px;
}
</style>