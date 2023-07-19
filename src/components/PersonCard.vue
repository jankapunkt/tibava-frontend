<template>
  <v-card 
  :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
  elevation="4"
  >
    <v-row align="center" justify="center" class="px-2 py-0">
      <v-col cols="8">
        <v-item-group>
          <v-row>
            <v-col v-for="(item, i) in cluster.image_paths" :key="i" cols="4">
              <v-img contain :src="item" max-height="100"> </v-img>
            </v-col>
          </v-row>
        </v-item-group>
      </v-col>
      
      <v-col cols="4">
        <v-list-item three-line>
          <v-list-item-content min-width>
            <div style="font-size: 16px; text-align: right; margin-bottom:0.2cm">Person {{ cluster.id }}</div>
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