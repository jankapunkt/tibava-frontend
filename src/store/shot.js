import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";
import { defineStore } from "pinia";

import { usePlayerStore } from "./player";
import { usePluginRunStore } from "./plugin_run";
import { usePluginRunResultStore } from "./plugin_run_result";

export const useShotStore = defineStore("shot", {
  state: () => {
    return {
      shots: [],
    };
  },
  getters: {
    forVideo: (state) => (videoId) => {
      return state.timelineList
        .map((id) => state.timelines[id])
        .filter((e) => e.video_id === videoId);
    },
  },
  actions: {
    buildShots() {
      const pluginRunStore = usePluginRunStore();
      const pluginRunResultStore = usePluginRunResultStore();
      const playerStore = usePlayerStore();

      let shotdetection = pluginRunStore
        .forVideo(playerStore.videoId)
        .filter((e) => {
          return e.type == "shotdetection" && e.status == "D";
        })
        .map((e) => {
          e.results = pluginRunResultStore.forPluginRun(e.id);
          return e;
        })
        .sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
      if (!shotdetection.length) {
        return [];
      }

      shotdetection = shotdetection.at(-1);
      let results = [];
      if (
        "results" in shotdetection &&
        shotdetection.results.length > 0 &&
        "data" in shotdetection.results[0]
      ) {
        results = shotdetection.results[0].data.shots.map((e) => {
          return {
            start: e.start,
            end: e.end,
          };
        });
      }

      let thumbnail = pluginRunStore
        .forVideo(playerStore.videoId)
        .filter((e) => {
          return e.type == "thumbnail" && e.status == "D";
        })
        .map((e) => {
          e.results = pluginRunResultStore.forPluginRun(e.id);
          return e;
        })
        .sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

      if (!thumbnail.length) {
        return results;
      }
      thumbnail = thumbnail.at(-1);

      // TODO this is not realy stable
      //TODO localhost should be replaced
      let thumbnail_dict = {};
      if (
        "results" in thumbnail &&
        thumbnail.results.length > 0 &&
        "data" in thumbnail.results[0]
      ) {
        thumbnail_dict = thumbnail.results[0].data.images.reduce(
          (a, b) => (
            (a[b.time] = config.THUMBNAIL_LOCATION + `/${b.id}.${b.ext}`), a
          ),
          {}
        );
      }
      results = results.map((e, i) => {
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
          id: i + 1,
          start: e.start,
          end: e.end,
          thumbnails: [
            thumbnail_dict[start_thumb_time],
            thumbnail_dict[mid_thumb_time],
            thumbnail_dict[end_thumb_time],
          ],
        };
      });
      this.shots = results;
    },
  },
});
