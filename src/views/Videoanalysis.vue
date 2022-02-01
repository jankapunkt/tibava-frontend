<template>
  <v-app>
    <v-row>
      <v-col>
        <VideoPlayer :video="$store.state.video.current" />
      </v-col>
      <v-col>
        <ShotsOverview :shots="shots" />
      </v-col>
    </v-row>
    <Timeline />
  </v-app>
</template>

<script>
import VideoPlayer from "@/components/VideoPlayer.vue";
import ShotsOverview from "@/components/ShotsOverview.vue";
import Timeline from "@/components/Timeline.vue";
// import store from "../store/index.js";

export default {
  data() {
    return {
      shots: [
        {
          id: 0,
          start: 0,
          end: 10,
          thumbnails: [
            "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
            "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
            "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
          ],
        },
        {
          id: 1,
          start: 11,
          end: 72,
          thumbnails: [
            "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
            "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
            "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
          ],
        },
      ],
    };
  },
  methods: {
    async fetch_data() {
      console.log(`fetch video ${JSON.stringify(this.$route.params)}`);

      await this.$store.dispatch("video/get", this.$route.params.hash_id);
      console.log(
        `new state ${JSON.stringify(this.$store.state.video.current)}`
      );

      await this.$store.dispatch("analyser/list", this.$route.params.hash_id);
      // console.log(res);
    },
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetch_data();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetch_data",

    // "$store.state.video.current": function (val) {
    //   console.log(`watch current ${JSON.stringify(val)}`);
    //   this.video = val;
    // },
  },
  components: {
    VideoPlayer,
    ShotsOverview,
    Timeline,
  },
};
</script>

<style scoped>
.logo > img {
  max-height: 56px;
}
</style>
