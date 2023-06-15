<template>
  <v-card 
  :class="['d-flex', 'flex-column', 'pa-2', 'ma-4', { highlighted: isHighlighted }]"
  elevation="4"
  v-on:click="setVideoPlayerTime(shot.start)"
  >
    <v-row align="center" justify="center" class="px-2 py-0">
      <v-col cols="4">
        <v-list-item three-line>
          <v-list-item-content min-width>
            <div class="text-overline mb-4">Shot {{ shot.id }}</div>
            <v-list-item-subtitle>Begin: {{ get_timecode(shot.start) }}</v-list-item-subtitle>
            <v-list-item-subtitle>End: {{ get_timecode(shot.end) }}</v-list-item-subtitle>
            <v-list-item-subtitle>Duration:
              {{ get_timecode(shot.end - shot.start) }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-col>

      <v-col cols="8">
        <v-item-group>
          <v-row>
            <v-col v-for="(item, i) in shot.thumbnails" :key="i" cols="4">
              <v-img contain :src="item" max-height="100"> </v-img>
            </v-col>
          </v-row>
        </v-item-group>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import TimeMixin from "../mixins/time";

import { mapStores } from "pinia";
import { usePlayerStore } from "@/store/player";

export default {
  mixins: [TimeMixin],
  props: ["shot"],
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
      if (this.shot.start <= cur_time && this.shot.end > cur_time){
        if(!this.emitted && this.syncTime){
          this.$emit('childHighlighted', this.shot.id);
        }
        this.emitted = true;
        return true
      }
      this.emitted = false;
      return false;
    },
    syncTime() {
      return this.playerStore.syncTime;
    },
    ...mapStores(usePlayerStore),
  }
};
</script>