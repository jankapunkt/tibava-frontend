<template>
  <v-card>
    <v-card-title>
      {{ $t("shotview.title") }}
    </v-card-title>
  </v-card>
</template>

<script>
export default {
  props: ["video", "analyses"],
  data() {
    return {
      shots: [],
    };
  },
  methods: {},
  computed: {},
};
</script>

<style>
.video-player {
  max-width: 768px;
  padding: 10px;

  margin: 10px;
}
.video-control {
  gap: 10px;
  margin-top: 5px;
}
.video-control > .pregress-bar {
  margin-top: auto;
  margin-bottom: auto;
}
.video-player > * {
  width: 100%;
}
</style>
