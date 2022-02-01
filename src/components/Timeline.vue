<template>
  <v-container>
    <v-card class="d-flex flex-column" height="400" width="100%" elevation="8">
      <h1>Timeline</h1>
      <!-- <v-row v-for="timeline in timelines" :key="timeline.id">
          {{ timeline.name }}
        </v-row> -->
    </v-card>
  </v-container>
</template>

<script>
export default {
  props: ["source"],
  data() {
    return {
      timelines: [
        {
          name: "face",
          segments: [],
        },
      ],
    };
  },
  methods: {},
  computed: {},
};
</script>
