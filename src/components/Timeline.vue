<template>
  <v-card>
    <v-row v-for="timeline in timelines" :key="timeline.id">
      {{ timeline.name }}
    </v-row>
  </v-card>
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
