<template>
    <v-card
    :class="['d-flex', 'flex-column', 'pa-2', 'ma-4', { highlighted: isHighlighted }]"
    elevation="4"
    v-on:click="setVideoPlayerTime(transcript.start)"
    >
      <span style="color:rgb(0, 0, 0); margin-bottom:0.2cm">{{ get_timecode(transcript.start) }}</span>
      <span>{{transcript.name}}</span>
    </v-card>
</template>

<script>
import TimeMixin from "../mixins/time";

import { mapStores } from "pinia";
import { usePlayerStore } from "@/store/player";

export default {
  mixins: [TimeMixin],
  props: ["transcript"],
  data () {
    return {
      // this variable ensures that the signal to scroll is only emitted once 
      emitted: false
    }
  },
  methods: {
    setVideoPlayerTime(time) {
      this.playerStore.setTargetTime(time);
    },
  },
  computed: {
    isHighlighted() {
      const cur_time = this.playerStore.currentTime;
      if (this.transcript.start <= cur_time && this.transcript.end > cur_time){
        if(!this.emitted && this.syncTime){
          this.$emit('childHighlighted', this.transcript.id);
        }
        this.emitted = true;
        return true
      }
      this.emitted = false;
      return false;
    },
    time(){
      return this.playerStore.currentTime;
    },
    syncTime() {
      return this.playerStore.syncTime;
    },
    ...mapStores(usePlayerStore),
  }
};
</script>

<style>
  .highlighted {
    background-color: rgba(43, 24, 27, 0.287) !important
  }
</style> 
