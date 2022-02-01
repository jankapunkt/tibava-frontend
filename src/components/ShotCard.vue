<template>
  <v-card
    class="d-flex flex-column py-2"
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
              {{ get_timecode(shot.end - shot.start) }}</v-list-item-subtitle
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
import TimeMixin from "../mixins/time";

export default {
  mixins: [TimeMixin],
  props: ["shot"],
  methods: {
    setVideoPlayerTime(time) {
      this.$emit("seek", time);
    },
  },
};
</script>