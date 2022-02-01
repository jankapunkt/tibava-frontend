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
    return {};
  },
  methods: {
    async fetch_data() {
      // console.log(`fetch video ${JSON.stringify(this.$route.params)}`);

      await this.$store.dispatch("video/get", this.$route.params.hash_id);
      // console.log(
      //   `new state ${JSON.stringify(this.$store.state.video.current)}`
      // );

      await this.$store.dispatch("analyser/list", this.$route.params.hash_id);
      // console.log(res);
    },
  },
  computed: {
    shots() {
      let shotdetection = this.$store.state.analyser.analyser
        .filter((e) => {
          return e.type == "shotdetection";
        })
        .sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

      if (!shotdetection.length) {
        return [];
      }

      shotdetection = shotdetection.at(-1);
      // if len(shotdetection)
      let results = shotdetection.results.map((e) => {
        return {
          id: e.shot_id,
          // start: e.start_time,
          // end: e.end_time,
          start: e.start_time_sec,
          end: e.end_time_sec,
        };
      });

      let thumbnail = this.$store.state.analyser.analyser
        .filter((e) => {
          return e.type == "thumbnail";
        })
        .sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

      if (!thumbnail.length) {
        return results;
      }
      thumbnail = thumbnail.at(-1);

      // TODO this is not realy stable
      let thumbnail_dict = thumbnail.results.reduce(
        (a, b) => ((a[b.time] = b.url), a),
        {}
      );

      results = results.map((e) => {
        return {
          id: e.id,
          // start: e.start_time,
          // end: e.end_time,
          start: e.start,
          end: e.end,
          thumbnails: [
            thumbnail_dict[Math.ceil(e.start)],
            thumbnail_dict[Math.round(e.start + (e.end - e.start) / 2)],
            thumbnail_dict[Math.floor(e.end)],
          ],
        };
      });
      console.log(thumbnail);
      console.log(thumbnail_dict);
      console.log(results);
      return results;
      return [
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
      ];
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
