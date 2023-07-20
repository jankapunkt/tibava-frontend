<template>
  <v-card 
  :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
  elevation="4"
  >
      <v-row no-gutters align="center" class="px-2 py-0">
        <v-col cols="3">
          <v-list-item three-line>
            <v-list-item-content min-width>
              <div style="font-size: 16px; margin-bottom:0.2cm">Person {{ cluster.id }}</div>
              <v-list-item-subtitle>Faces: {{ cluster.image_paths.length }}</v-list-item-subtitle>
              <v-list-item-subtitle>First: {{ cluster.timestamps[0] }}</v-list-item-subtitle>
              <v-list-item-subtitle>Last: {{ cluster.timestamps[cluster.timestamps.length-1] }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>

        <v-col cols="6">
          <v-item-group>
            <v-row>
              <v-col v-for="(item, i) in cluster.image_paths.slice(0, 5)" :key="i" cols="2">
                <v-img contain :src="item" max-height="100" @click="goToFace(cluster.timestamps[i])"> </v-img>
              </v-col>
            </v-row>
          </v-item-group>
        </v-col>
        <v-col cols="1">
            <v-btn  @click="createTimeline">to timeline</v-btn>
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
  props: ["cluster"],
  data () {
    return {
      // this variable ensures that the signal to scroll is only emitted once 
      emitted: false
    }
  },
  methods: {
    createTimeline(){

    },
    setVideoPlayerTime(time) {
      this.playerStore.setTargetTime(time);
    },
    goToFace(time){
      this.playerStore.setTargetTime(time);
    }
  },
  computed: {
    syncTime() {
      return this.playerStore.syncTime;
    },
    ...mapStores(usePlayerStore),
  }
};
</script>