<template>
  <v-card
    class="d-flex flex-column"
    width="100%"
    elevation="4"
    v-on:click="setVideoPlayerTime(shot.start)"
  >
    <v-card-title class="px-2 py-1">Shot {{ shot.id }}</v-card-title>
    <v-row align="center" justify="center" class="px-2 py-0">
      <v-col cols="4">
        <v-list-item three-line>
          <v-list-item-content min-width>
            <!-- <div class="text-overline mb-4">Shot {{ shot.id }}</div> -->
            <v-list-item-subtitle
              >Begin: {{ get_timecode(shot.start) }}</v-list-item-subtitle
            >
            <v-list-item-subtitle
              >End: {{ get_timecode(shot.end) }}</v-list-item-subtitle
            >
            <v-list-item-subtitle
              >Duration:
              {{
                get_display_time(shot.end - shot.start)
              }}</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </v-col>

      <v-col cols="8">
        <v-item-group>
          <v-row>
            <v-col v-for="(item, i) in shot.thumbnails" :key="i" cols="4">
              <v-img :src="item" max-height="100%"> </v-img>
            </v-col>
          </v-row>
        </v-item-group>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { get_display_time as helper_get_display_time } from "@/plugins/helpers.js";
import { get_timecode as helper_get_timecode } from "@/plugins/helpers.js";
export default {
  props: ["shot"],
  methods: {
    get_timecode: helper_get_timecode,
    get_display_time: helper_get_display_time,
    setVideoPlayerTime(time) {
      this.$emit("seek", time);
    },
  },
  watch: {
    shot() {
      console.log(this.shot);
      this.$store.state.analyser.analyser;
    },
  },
};
</script>