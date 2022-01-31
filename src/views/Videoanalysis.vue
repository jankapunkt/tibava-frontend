<template>
  <v-app> <VideoPlayer :source="source" /> </v-app>
</template>

<script>
import VideoPlayer from "@/components/VideoPlayer.vue";

export default {
  computed: {
    source() {
      console.log(this.$store.state.video.video.url);
      return this.$store.state.video.video.url;
    },
  },
  components: {
    VideoPlayer,
  },
};
</script>

<style scoped>
.logo > img {
  max-height: 56px;
}
</style>
