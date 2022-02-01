<template>
  <v-card class="d-flex flex-column">
    <v-list-item three-line>
      <v-list-item-content>
        <div class="text-overline mb-4">Shot {{ shot.id }}</div>
        <v-list-item-subtitle
          >Begin: {{ get_timecode(shot.start) }}</v-list-item-subtitle
        >
        <v-list-item-subtitle
          >End: {{ get_timecode(shot.end) }}</v-list-item-subtitle
        >
        <v-list-item-subtitle
          >Duration:
          {{ get_display_time(shot.end - shot.start) }}</v-list-item-subtitle
        >
      </v-list-item-content>

      <v-row>
        <v-list-item-avatar tile size="80" color="grey"></v-list-item-avatar>
        <v-list-item-avatar tile size="80" color="grey"></v-list-item-avatar>
        <v-list-item-avatar tile size="80" color="grey"></v-list-item-avatar>
      </v-row>
    </v-list-item>
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
  },
};
</script>