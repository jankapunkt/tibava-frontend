<template>
  <div>
    <v-card
    :class="['d-flex', 'flex-column', 'pa-2', 'ma-4', { highlighted: isHighlighted }]"
    elevation="4"
    v-on:click="setVideoPlayerTime(transcript.start)"
    >
      <span style="color:rgb(0, 0, 0); margin-bottom:0.2cm">{{ get_timecode(transcript.start) }}</span>
      <span>{{transcript.name}}</span>
    </v-card>
  </div>
</template>

<script>
import TimeMixin from "../mixins/time";

import { mapStores } from "pinia";
import { usePlayerStore } from "@/store/player";
import { useTimelineSegmentAnnotationStore } from "../store/timeline_segment_annotation";

export default {
  mixins: [TimeMixin],
  props: ["transcript"],
  methods: {
    setVideoPlayerTime(time) {
      this.playerStore.setTargetTime(time);
    },
  },
  computed: {
    isHighlighted() {
      const cur_time = this.playerStore.currentTime;
      return this.transcript.start <= cur_time && this.transcript.end > cur_time;
    },
    time(){
      return this.playerStore.currentTime;
    },
    ...mapStores(usePlayerStore, useTimelineSegmentAnnotationStore),
  }
};
</script>

<style>
  .highlighted {
    background-color: rgba(43, 24, 27, 0.287) !important
  }
</style> 
