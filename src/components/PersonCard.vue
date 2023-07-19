<template>
  <v-card 
  :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
  elevation="4"
  style="border: 1px solid black"
  >
    <v-row align="center" justify="center" class="px-2 py-0">
      <v-col cols="8">
        <v-item-group>
          <v-row>
            <v-col style="align-items: center; display: flex;"  v-for="(item, i) in cluster.image_paths.slice(0, 5)" :key="i" cols="2">
              <v-img contain :src="item" max-height="100"> </v-img>
            </v-col>
          </v-row>
        </v-item-group>
      </v-col>
      
      <v-col cols="4">
        <v-list-item three-line>
          <v-list-item-content min-width>
            <div style="font-size: 16px; text-align: center; margin-bottom:0.2cm">Person {{ cluster.id }}</div>
            <div style="font-size: 16px; text-align: center; margin-bottom:0.2cm">#Faces: {{ cluster.image_paths.length }}</div>
            <v-btn style="border: 1px solid black" text @click="createTimeline">to timeline</v-btn>
          </v-list-item-content>
        </v-list-item>
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
  },
  computed: {
    syncTime() {
      return this.playerStore.syncTime;
    },
    ...mapStores(usePlayerStore),
  }
};
</script>