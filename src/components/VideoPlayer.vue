<template>
  <v-card class="video-player d-flex flex-column" elevation="8">
    <video
      ref="video"
      v-on:timeupdate="onTimeUpdate"
      v-on:ended="onEnded"
      v-on:click="toggle"
      v-on:play="onPlay"
      v-on:pause="onPause"
      :src="video.url"
    >
      <!-- <source :src="video.url" type="video/mp4" /> -->
    </video>
    <v-flex class="video-control d-flex">
      <v-btn @click="toggle" small>
        <v-icon v-if="ended"> mdi-restart</v-icon>
        <v-icon v-else-if="playing"> mdi-pause</v-icon>
        <v-icon v-else> mdi-play</v-icon>
      </v-btn>

      <v-slider
        class="pregress-bar"
        :value="100 * progress"
        v-on:change="onSeek"
        hide-details
      ></v-slider>

      <v-menu top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" small>
            {{ currentSpeed.title }}
          </v-btn>
        </template>

        <v-list>
          <v-list-item v-for="(item, index) in speeds" :key="index">
            <v-list-item-title v-on:click="onSpeedChange(index)">{{
              item.title
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-flex>
  </v-card>
</template>

<script>
export default {
  props: ["video"],
  data() {
    return {
      playing: false,
      currentTime: 0,
      duration: 0,
      ended: false,
      currentSpeed: { title: "1.00", value: 1.0 },
      speeds: [
        { title: "0.25", value: 0.25 },
        { title: "0.50", value: 0.5 },
        { title: "0.75", value: 0.75 },
        { title: "1.00", value: 1.0 },
        { title: "1.25", value: 1.25 },
        { title: "1.50", value: 1.5 },
        { title: "1.75", value: 1.75 },
        { title: "2.00", value: 2.0 },
      ],
    };
  },
  methods: {
    toggle() {
      if (this.playing) {
        this.$refs.video.pause();
      } else {
        this.$refs.video.play();
      }
    },
    onEnded() {
      this.ended = true;
      this.playing = false;
    },
    onPause() {
      this.playing = false;
    },
    onPlay() {
      this.playing = true;
      this.ended = false;
    },
    onTimeUpdate(event) {
      this.currentTime = event.srcElement.currentTime;
      this.duration = event.srcElement.duration;
      this.ended = event.srcElement.ended;
    },
    onSeek(percentage) {
      this.$refs.video.currentTime = (this.duration * percentage) / 100;
      console.log(percentage);
    },
    onSpeedChange(idx) {
      this.currentSpeed = this.speeds[idx];
      this.$refs.video.playbackRate = this.currentSpeed.value;
    },
  },
  computed: {
    progress() {
      if (this.duration <= 0) {
        return 0;
      }
      return this.currentTime / this.duration;
    },
  },
};
</script>

<style>
.video-player {
  max-width: 900px;
  padding: 10px;
  margin: 10px;
}
.video-control {
  gap: 10px;
  margin-top: 5px;
}
.video-control > .pregress-bar {
  margin-top: auto;
  margin-bottom: auto;
}
.video-player > * {
  width: 100%;
}
</style>
