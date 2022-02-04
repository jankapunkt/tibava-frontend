<template>
  <v-row>
    <v-col class="timeline-header">
      <v-card class="timeline-head" v-for="item in timelines" :key="item.id">
        <v-flex class="timeline-control d-flex">
          <v-menu center :offset-x="true" rounded>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-menu </v-icon>
            </template>
            <v-list>
              <v-list-item>
                <h2>{{ item.name }}</h2>
              </v-list-item>
              <v-list-item link v-on:click="copyTimeline(item.hash_id)">
                <v-list-item-title>
                  <v-icon left>{{ "mdi-content-copy" }}</v-icon>
                  Duplicate
                </v-list-item-title>
              </v-list-item>
              <v-list-item link v-on:click="renameTimeline(item.hash_id)">
                <v-list-item-title>
                  <v-icon left>{{ "mdi-pencil" }}</v-icon>
                  Rename
                </v-list-item-title>
              </v-list-item>
              <v-list-item link v-on:click="deleteTimeline(item.hash_id)">
                <v-list-item-title>
                  <v-icon left>{{ "mdi-delete" }}</v-icon>
                  Delete
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-card-subtitle>{{ item.name }}</v-card-subtitle>
        </v-flex>
      </v-card>
    </v-col>
    <v-col class="timeline-bar">
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

      <v-menu
        :value="menu.show"
        :position-x="menu.x"
        :position-y="menu.y"
        transition="fade-transition"
        absolute
        offset-y
        :close-on-click="false"
        :close-on-content-click="false"
      >
        <slot name="context"></slot>
      </v-menu>
    </v-col>
  </v-row>
</template>

<script>
import AnnotationForm from "@/components/AnnotationForm.vue";
import TimeMixin from "../mixins/time";
import keyInObj from "../plugins/helpers";

export default {
  mixins: [TimeMixin],
  props: [
    "video",
    "time",
    "timelines",
    "startTime",
    "endTime",
    "annotation_dialog",
  ],
  data() {
    return {
      //pixel per seconds
      timeline_drawer: false,
      context: null,
      scale: 60,
      // startTime: 0,
      // endTime: 90,
      timelineHeight: 50,
      timelineWidth: 120,
      scaleHeight: 50,
      width: 0,
      foregroundColor: "rgba(255,255, 255, 1)",
      backgroundColor: "rgba(230, 57, 70, 1)",
      textColor: "rgba(230, 57, 70, 1)",
      pad: 5,
      gap: 5,
      gapSegment: 2,

      mouse: {
        start: null,
        down: null,
      },

      menu: {
        show: false,
        x: null,
        y: null,
      },
      timeline_boxes: [],
      segment_boxes: [],
    };
  },
  methods: {
    draw() {
      console.log(`${this.startTime} ${this.endTime}`);
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext("2d");

      this.ctx.save();

      this.width = this.$refs.canvas.parentElement.clientWidth;
      this.timeScale =
        (this.width - 2 * this.pad) / (this.endTime - this.startTime);
      this.$refs.canvas.width = this.$refs.canvas.parentElement.clientWidth;
      this.$refs.canvas.height = this.$refs.canvas.parentElement.clientHeight;
      // console.log(this.timelines);

      this.timeline_boxes = [];
      this.segment_boxes = [];
      this.draw_scale();
      if (this.timelines) {
        this.draw_timelines();
      }
      this.drawCurrentTime();
    },

    draw_timelines() {
      this.ctx.save();
      for (let i = 0; i < this.timelines.length; i++) {
        this.draw_timeline(
          this.pad,
          this.scaleHeight + this.pad + i * (this.timelineHeight + this.gap),
          this.$refs.canvas.width - 2 * this.pad,
          this.timelineHeight,
          this.timelines[i].segments,
          this.timelines[i].hash_id
        );
      }
      this.ctx.restore();
    },
    draw_timeline(x, y, width, height, segments, hash_id) {
      this.ctx.shadowColor = "black";
      this.ctx.shadowBlur = 1;

      this.ctx.fillStyle = "white";
      this.ctx.fillRect(x, y, width, height);
      this.timeline_boxes.push({
        x,
        y,
        width,
        height,
        hash_id,
      });
      this.ctx.stroke();
      var that = this;
      segments.forEach(function (e) {
        that.ctx.save();
        let start = Math.max(e.start, that.startTime);
        let end = Math.min(e.end, that.endTime);
        if (end == start) {
          // Nothing to draw
          return;
        }

        that.segment_boxes.push({
          x: that.timeToX(start),
          y: y,
          width: that.timeToX(end) - that.timeToX(start),
          height: height,
          hash_id: e.hash_id,
        });

        that.ctx.fillStyle = e.color;
        that.ctx.fillRect(
          that.timeToX(start) + that.gapSegment,
          y,
          that.timeToX(end) - that.timeToX(start) - 2 * that.gapSegment,
          height
        );
        // that.ctx.clip();
        if (typeof e === "object" && "label" in e) {
          that.ctx.fillStyle = "black";
          that.ctx.font = "16px serif";
          let text_mid =
            (that.timeToX(end) - that.timeToX(start)) / 2 + that.timeToX(start);

          that.ctx.fillText(
            e.labels.join(","),
            text_mid,
            y + (height + 16) / 2
          );
        }
        that.ctx.restore();
      });
    },
    draw_scale() {
      this.ctx.save();

      let shiftY = this.scaleHeight - 4 * this.pad;
      let that = this;
      let timestemps = this.linspace(this.startTime, this.endTime, 15);
      timestemps.pop();
      console.log(timestemps);
      timestemps.forEach(function (time, index) {
        console.log(time);
        that.ctx.font = "16px serif";
        that.ctx.textAlign = "left";
        that.ctx.fillText(that.get_timecode(time), that.timeToX(time), shiftY);

        // that.ctx.beginPath();
        that.ctx.lineWidth = 0.5;
        that.ctx.strokeStyle = "black";
        that.ctx.moveTo(that.timeToX(time), shiftY + 5);
        that.ctx.lineTo(that.timeToX(time), shiftY + 20);
        that.ctx.stroke();
      });
      //   that.ctx.font = "16px serif";
      //   that.ctx.textAlign = "left";
      //   that.ctx.fillStyle = "black";
      //   that.ctx.fillText(that.get_timecode(time), that.timeToX(time), shiftY);

      //   that.ctx.beginPath();
      //   that.ctx.lineWidth = 0.5;
      //   that.ctx.strokeStyle = "black";
      //   that.ctx.moveTo(that.timeToX(time), shiftY + 5);
      //   that.ctx.lineTo(that.timeToX(time), shiftY + 20);
      //   that.ctx.stroke();
      //   that.ctx.closePath();
      // });

      // let shiftY = this.scaleHeight - 4 * this.pad;
      // for (let i = this.startTime; i < this.endTime; i++) {
      //   this.ctx.font = "16px serif";
      //   this.ctx.textAlign = "left";
      //   this.ctx.fillText(this.get_timecode(i), this.timeToX(i), shiftY);

      //   // this.ctx.beginPath();
      //   this.ctx.lineWidth = 0.5;
      //   this.ctx.strokeStyle = "black";
      //   this.ctx.moveTo(this.timeToX(i + 0.5), shiftY + 15);
      //   this.ctx.lineTo(this.timeToX(i + 0.5), shiftY + 20);
      //   this.ctx.moveTo(this.timeToX(i), shiftY + 5);
      //   this.ctx.lineTo(this.timeToX(i), shiftY + 20);
      //   this.ctx.stroke();
      // }
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
    linspace(startValue, stopValue, cardinality) {
      var arr = [];
      var step = (stopValue - startValue) / (cardinality - 1);
      for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + step * i);
      }
      return arr;
    },
    timeToX(time) {
      return this.timeScale * (time - this.startTime) + this.pad;
    },
    xToTime(x) {
      return (x - this.pad) / this.timeScale + this.startTime;
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
    clickOutside() {
      // this.mouse.down = false;
      // this.menu.show = false;
    },
    showSegmentContext(hash_id, evt) {
      // TODO maybe there is a better solution
      this.$emit("segmentSelected", hash_id);
      this.menu = {
        show: false,
        x: evt.clientX,
        y: evt.clientY,
      };
      this.$nextTick(() => {
        this.menu.show = true;
      });
    },

    onMouseClick(evt) {
      evt.preventDefault();
      let mouse_pos = this.mousePos(evt);
      let time = this.xToTime(mouse_pos.x);
      let that = this;
      let catched = false;
      this.segment_boxes.forEach(function (e) {
        let match = that.contains(e, mouse_pos);
        if (match) {
          catched = true;
          that.showSegmentContext(e.hash_id, evt);
        }
      });
      if (catched) {
        return;
      } else {
        this.menu.show = false;
      }
      this.timeline_boxes.forEach(function (e) {
        let match = that.contains(e, mouse_pos);
        if (match) {
          catched = true;
        }
      });
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
    copyTimeline(hash_id) {
      this.$emit("copyTimeline", hash_id);
      console.log("Copy timeline " + hash_id);
    },
    renameTimeline(hash_id) {
      this.$emit("renameTimeline", hash_id);
      console.log("Rename timeline " + hash_id);
    },
    deleteTimeline(hash_id) {
      this.$emit("deleteTimeline", hash_id);
      console.log("Delete timeline " + hash_id);
    },
  },
  watch: {
    video() {
      this.draw();
    },
    timelines() {
      this.draw();
    },
    time() {
      this.draw();
    },
    startTime() {
      this.draw();
    },
    endTime() {
      this.draw();
    },
    annotation_dialog() {
      this.menu.show = this.annotation_dialog;
    },
  },
  computed: {},
  mounted() {
    this.draw();
  },
  components: {
    AnnotationForm,
  },
};
</script>


<style>
.timeline-header {
  margin-top: 60px;
  width: 10%;
  max-width: 10%;
  padding: 0;
  margin-left: 20px;
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
.timeline-control {
  gap: 2px;
}

.timeline-control > * {
  align-items: center;
  justify-content: center;
}
</style>