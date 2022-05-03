<template>
  <v-card
    class="d-flex flex-column pa-2 ma-4"
    elevation="4"
    v-on:click="setVideoPlayerTime(segment.start)"
  >
    <v-card-title class="px-2 py-1">Entities for segment {{ segment.id }} of timeline {{segment.name}}</v-card-title>
    <v-row align="center" justify="center" class="px-2 py-0">
      <v-col cols="4">
        <v-list-item three-line>
          <v-list-item-content min-width>
            <v-list-item-subtitle
              >Begin: {{ get_timecode(segment.start) }}</v-list-item-subtitle
            >
            <v-list-item-subtitle
              >End: {{ get_timecode(segment.end) }}</v-list-item-subtitle
            >
            <v-list-item-subtitle
              >Duration:
              {{ get_timecode(segment.end - segment.start) }}</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </v-col>

      <v-col cols="8">
        <v-item-group>
          <v-row>
            <v-col v-for="(item, i) in segment.annotations" :key="i" cols="3">
              <v-chip :color="item.color">{{ item.entity_name }}</v-chip>
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
  props: ["segment"],
  methods: {
    setVideoPlayerTime(time) {
      this.$emit("seek", time);
    },
  },
};
</script>
