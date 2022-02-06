<template>
  <v-app>
    <v-row class="top-container pa-8" justify="space-around" align="start">
      <v-col md="6" height="100%" class="full-height-row">
        <v-card
          class="video-player d-flex flex-column full-height-row"
          elevation="8"
        >
          <v-row>
            <v-card-title>
              {{ $store.state.video.current.meta.name }}
            </v-card-title>
          </v-row>

          <v-row class="flex-grow-1">
            <v-col>
              <VideoPlayer
                :video="$store.state.video.current"
                :time="videoTime"
                @timeUpdate="onTimeUpdate"
              />
            </v-col>
          </v-row>
          <v-row class="align-center timeline-bar">
            <TimeSelector
              :video="$store.state.video.current"
              :startTime="startTime"
              :endTime="endTime"
              @endTimeChange="onEndTimeChange"
              @startTimeChange="onStartTimeChange"
            />
          </v-row>
        </v-card>
      </v-col>

      <v-col md="6" justify="center" class="full-height-row">
        <v-card class="overflow-auto full-height-row" elevation="8">
          <v-tabs centered>
            <v-tabs-slider />
            <v-tab>Shots</v-tab>
            <v-tab disabled>Persons</v-tab>
            <v-tab disabled>Scenes</v-tab>

            <v-tab-item>
              <ShotCard
                v-for="item in shots"
                v-bind:key="item.id"
                :shot="item"
                v-on:seek="setVideoPlayerTime"
              />
              <!-- <ShotsOverview :shots="shots" v-on:seek="setVideoPlayerTime" /> -->
            </v-tab-item>
            <v-tab-item> PERSONS </v-tab-item>
            <v-tab-item> SCENES </v-tab-item>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="space-around" align="start" class="pa-8">
      <v-col justify="center">
        <v-card class="annotation-card d-flex flex-column" elevation="8">
          <v-row>
            <v-col>
              <v-card-title> Annotation Timeline </v-card-title>
            </v-col>
          </v-row>

          <Timeline
            :video="$store.state.video.current"
            :time="currentTime"
            :timelines="$store.state.timeline.timelines"
            :startTime="startTime"
            :endTime="endTime"
            :annotation_dialog="anotation_dialog"
            @copyTimeline="onCopyTimeline"
            @renameTimeline="onRenameTimeline"
            @deleteTimeline="onDeleteTimeline"
            @segmentSelected="onSegmentSelected"
          >
            <template v-slot:context>
              <v-list class="pa-0">
                <v-subheader> {{ $t("annotation.title") }}</v-subheader>
                <v-list-item class="px-0 h44">
                  <v-form class="ma-2" @submit="onAppendAnnotation">
                    <v-text-field v-model="addedAnnotation"></v-text-field>
                  </v-form>
                </v-list-item>

                <v-list>
                  <v-subheader>Labels</v-subheader>
                  <v-list-item-group v-model="selectedLabel">
                    <v-list-item v-for="(item, i) in labels" :key="i">
                      <v-list-item-content v-on:click="submitAnnotation">
                        <v-list-item-title v-text="item"></v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>

                <v-list-item class="px-0 h44">
                  <v-btn text block large @click="submitAnnotation">
                    {{ $t("annotation.ok") }}
                  </v-btn>
                </v-list-item>
              </v-list>
            </template>
          </Timeline>
        </v-card>
      </v-col>
    </v-row>
  </v-app>
</template>

<script>
import VideoPlayer from "@/components/VideoPlayer.vue";
import ShotCard from "@/components/ShotCard.vue";
import Timeline from "@/components/Timeline.vue";
import TimeSelector from "@/components/TimeSelector.vue";
// import store from "../store/index.js";

export default {
  data() {
    return {
      anotation_dialog: false,
      videoTime: 0,
      currentTime: 0,
      startTime: 0,
      endTime: 0,
      selectedSegment: null,
      addedAnnotation: null,
      labels: [],
    };
  },
  methods: {
    async fetch_data() {
      // console.log(`fetch video ${JSON.stringify(this.$route.params)}`);

      await this.$store.dispatch("video/get", this.$route.params.id);
      // console.log(
      //   `new state ${JSON.stringify(this.$store.state.video.current)}`
      // );
      if (this.$store.state.video.current.meta) {
        this.endTime = this.$store.state.video.current.meta.duration;
      }

      await this.$store.dispatch("analyser/list", this.$route.params.id);

      await this.$store.dispatch("timeline/listUpdate", this.$route.params.id);
      console.log("FOOBAR");
      console.log(this.$store.state.timeline.timelineList);
      this.$store.state.timeline.timelineList.forEach((e) => {
        console.log(e);
        this.$store.dispatch("segment/listUpdate", e);
      });
      // console.log(res);
    },
    setVideoPlayerTime(time) {
      this.videoTime = time;
    },
    onTimeUpdate(time) {
      this.currentTime = time;
    },
    onEndTimeChange(time) {
      this.endTime = time;
    },
    onStartTimeChange(time) {
      this.startTime = time;
    },
    onCopyTimeline(id) {
      this.$store.dispatch("timeline/duplicate", id);
    },
    onRenameTimeline(id) {
      this.$store.dispatch("timeline/rename", id);
    },
    onDeleteTimeline(id) {
      this.$store.dispatch("timeline/delete", id);
    },
    onSegmentSelected(id) {
      this.selectedSegment = id;
      console.log(id);
      // this.$store.dispatch("timeline/delete", id);
    },
    onAppendAnnotation(evt) {
      evt.preventDefault();
      this.$store.dispatch("timeline/annotate", {
        segment_id: this.selectedSegment,
        annotation: this.addedAnnotation,
      });
      this.labels.push(this.addedAnnotation);
      this.addedAnnotation = null;
      console.log(this.selectedSegment);
      console.log(this.addedAnnotation);
      this.annotation_dialog = false;
    },
    submitAnnotation(evt) {
      console.log(this.selectedSegment);
      console.log(this.addedAnnotation);
      this.annotation_dialog = false;
    },
  },
  computed: {
    timelines() {
      let timelines = this.$store.getters["timeline/forVideo"](
        this.$route.params.id
      );
      timelines.forEach((e) => {
        console.log(e);
        let segments = this.$store.getters["segment/forTimeline"](e.id);

        e.segments = segments;
      });

      console.log(JSON.stringify(timelines));
      return timelines;
    },

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
        let duration = e.end - e.start;

        let start_thumb_time = 0;
        let mid_thumb_time = 0;
        let end_thumb_time = 0;

        if (duration < 2) {
          start_thumb_time = Math.ceil(e.start + duration / 2);
          mid_thumb_time = Math.round(e.start + duration / 2);
          end_thumb_time = Math.floor(e.start + duration / 2);
        } else {
          start_thumb_time = Math.ceil(e.start + duration / 5);
          mid_thumb_time = Math.round(e.start + duration / 2);
          end_thumb_time = Math.floor(e.start + (duration * 4) / 5);
        }

        if (start_thumb_time > mid_thumb_time) {
          start_thumb_time = mid_thumb_time;
        }

        if (mid_thumb_time > end_thumb_time) {
          end_thumb_time = mid_thumb_time;
        }

        return {
          id: e.id,
          start: e.start,
          end: e.end,
          thumbnails: [
            thumbnail_dict[start_thumb_time],
            thumbnail_dict[mid_thumb_time],
            thumbnail_dict[end_thumb_time],
          ],
        };
      });
      return results;
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
  },
  components: {
    VideoPlayer,
    ShotCard,
    Timeline,
    TimeSelector,
  },
};
</script>

<style scoped>
.logo > img {
  max-height: 56px;
}

.card-title {
  font-size: 64;
}

.video-player > * {
  width: 100%;
  max-width: 100%;
  padding: auto;
  margin: auto;
}
.timeline-bar {
  width: 100%;
  height: 100%;
}

.top-container {
  height: 820px;
}

.annotation-card {
  height: 500px;
  width: 100%;
  max-width: 100%;
}

.full-height-row {
  height: 100%;
}
</style>
