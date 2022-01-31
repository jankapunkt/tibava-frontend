<template>
  <v-app> <VideoPlayer :source="source" /> <Timeline /></v-app>
</template>

<script>
import VideoPlayer from "@/components/VideoPlayer.vue";
import Timeline from "@/components/Timeline.vue";

export default {
  computed: {
    source() {
      return this.$store.state.video.video.url;
    },
  },
  components: {
    VideoPlayer,
    Timeline,
  },
};
</script>

<style scoped>
.logo > img {
  max-height: 56px;
}
</style>
