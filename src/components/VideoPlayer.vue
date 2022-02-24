<template>
  <v-container class="d-flex flex-column">
    <v-row class="video-container">
      <video
        class="video-player"
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
    </v-row>

    <v-row class="video-control mt-6">
      <v-btn @click="deltaSeek(-1)" small>
        <v-icon> mdi-skip-backward</v-icon>
      </v-btn>
      <v-btn @click="deltaSeek(-0.01)" small>
        <v-icon> mdi-skip-previous</v-icon>
      </v-btn>
      <v-btn @click="toggle" small>
        <v-icon v-if="ended"> mdi-restart</v-icon>
        <v-icon v-else-if="playing"> mdi-pause</v-icon>
        <v-icon v-else> mdi-play</v-icon>
      </v-btn>

      <v-btn @click="deltaSeek(0.01)" small>
        <v-icon> mdi-skip-next</v-icon>
      </v-btn>
      <v-btn @click="deltaSeek(1)" small>
        <v-icon> mdi-skip-forward</v-icon>
      </v-btn>
      <div class="time-code flex-grow-1 flex-shrink-0">
        {{ get_timecode(currentTime) }}
      </div>
      <v-menu offset-y top>
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
      <!-- <v-btn small>
        <v-icon>mdi-repeat</v-icon>
      </v-btn> -->
      <v-btn @click="onToggleVolume" small>
        <v-icon v-if="volume > 66"> mdi-volume-high </v-icon>
        <v-icon v-else-if="volume > 33"> mdi-volume-medium </v-icon>
        <v-icon v-else-if="volume > 0"> mdi-volume-low </v-icon>
        <v-icon v-else-if="volume == 0"> mdi-volume-mute </v-icon>
      </v-btn>
      <v-slider
        :value="volume"
        @input="onVolumeChange"
        max="100"
        min="0"
        hide-details
      ></v-slider>
    </v-row>

    <v-row>
      <v-slider
        class="progress-bar"
        :value="100 * progress"
        v-on:change="onSeek"
        hide-details
      ></v-slider>
    </v-row>
  </v-container>
</template>

<script>
import TimeMixin from "../mixins/time";

export default {
  mixins: [TimeMixin],
  model: {
    prob: "time",
    event: "timeUpdate",
  },
  props: ["video", "time"],
  data() {
    return {
      playing: false,
      currentTime: this.time,
      duration: 0,
      ended: false,
      hiddenVolume: 1.0,
      mute: false,
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
    deltaSeek(delta) {
      this.$refs.video.currentTime += delta;
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
      this.$emit("timeUpdate", this.currentTime);
    },
    onSeek(percentage) {
      this.$refs.video.currentTime = (this.duration * percentage) / 100;
      console.log(percentage);
    },
    onSpeedChange(idx) {
      this.currentSpeed = this.speeds[idx];
      this.$refs.video.playbackRate = this.currentSpeed.value;
    },
    onToggleVolume() {
      this.mute = !this.mute;
      if (this.mute) {
        this.$refs.video.volume = 0.0;
      } else {
        this.$refs.video.volume = this.hiddenVolume;
      }
    },
    onVolumeChange(volume) {
      console.log("changemekfme");
      this.hiddenVolume = volume / 100;
      if (this.hiddenVolume > 0) {
        this.mute = false;
      }
      this.$refs.video.volume = this.hiddenVolume;
    },
  },
  computed: {
    progress() {
      if (this.duration <= 0) {
        return 0;
      }
      return this.currentTime / this.duration;
    },
    volume() {
      if (this.mute) {
        return 0;
      }
      return Math.round(this.hiddenVolume * 100);
    },
  },
  watch: {
    time() {
      this.$refs.video.currentTime = this.time;
    },
  },
};
</script>

<style>
.video-player {
  max-width: 100%;
  height: 100%;
  max-height: 512px;
  background-color: black;
}
.video-control {
  gap: 5px;
  /* margin-top: 5px;
  margin-bottom: 0px; */
  /* max-width: 100%; */
}
.video-control > .progress-bar {
  margin-top: auto;
  margin-bottom: auto;
}
.video-control > .time-code {
  margin-top: auto;
  margin-bottom: auto;
}
.video-container {
  background-color: black;
  justify-content: center;
}
</style>
