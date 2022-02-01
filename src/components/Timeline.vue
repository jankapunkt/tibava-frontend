<template>
  <v-container>
    <v-card class="d-flex flex-column" height="400" width="100%" elevation="8">
      <h1>Timeline</h1>
      <canvas ref="canvas"> </canvas>
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
      //pixel per seconds
      context: null,
      scale: 60,
      width_header: 120,
      timelines: [
        {
          name: "face",
          segments: [],
        },
      ],
    };
  },
  methods: {
    init() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext("2d");

      this.$refs.canvas.width = this.$refs.canvas.parentElement.clientWidth;
      this.$refs.canvas.height = this.$refs.canvas.parentElement.clientHeight;
      console.log("FOO");

      console.log(`video ${JSON.stringify(this.video)}`);
      let scale_y = 10;
      for (let i = 0; i <= this.video.meta.duration; i++) {
        // this.ctx.font = "12px serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.get_timecode(i), this.time_to_x(i), scale_y);

        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(this.time_to_x(i + 0.5), scale_y + 15);
        this.ctx.lineTo(this.time_to_x(i + 0.5), scale_y + 20);
        this.ctx.moveTo(this.time_to_x(i), scale_y + 5);
        this.ctx.lineTo(this.time_to_x(i), scale_y + 20);
        this.ctx.stroke();
      }
      // this.ctx.beginPath();
      // this.ctx.rect(0, 0, 100, 100);
      // this.ctx.lineWidth = 1;
      // this.ctx.strokeStyle = "rgba(230, 57, 70, 1)";
      // this.ctx.stroke();
    },
    draw_scale() {},
    time_to_x(time) {
      return this.scale * time + this.width_header;
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
  },
  computed: {},
  mounted() {
    this.init();
  },
};
</script>
