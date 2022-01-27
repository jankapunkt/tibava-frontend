<template>
  <v-app> <VideoPlayer /> </v-app>
</template>

<script>
import VideoPlayer from "@/components/VideoPlayer.vue";

export default {
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
