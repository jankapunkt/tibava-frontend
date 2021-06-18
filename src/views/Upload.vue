<template>
  <div>
    <VideoUploader />
  </div>
</template>


<script>
// @ is an alias to /src
import VideoUploader from "@/components/VideoUploader.vue";
export default {
  name: "Upload",
  components: {
    VideoUploader,
  },
};

</script>