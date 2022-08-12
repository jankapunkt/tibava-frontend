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
      return
      const pluginRunStore = usePluginRunStore();
      const pluginRunResultStore = usePluginRunResultStore();
      const playerStore = usePlayerStore();

      let shotdetection = pluginRunStore
        .forVideo(playerStore.videoId)
        .filter((e) => {
          return e.type == "shotdetection" && e.status == "DONE";
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
          return e.type == "thumbnail" && e.status == "DONE";
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

      // console.log(thumbnail_dict);

      results = results.map((e, i) => {
        const shot_thumbnails = new Map();
        Object.keys(thumbnail_dict).forEach(function (key) {
          if (parseFloat(key) >= e.start && parseFloat(key) <= e.end) {
            shot_thumbnails.set(parseFloat(key), thumbnail_dict[key]);
          }
        });
        const shot_thumbnails_sorted = new Map(
          [...shot_thumbnails.entries()].sort()
        );
        const thumbnails = Array.from(shot_thumbnails_sorted.values());

        return {
          id: i + 1,
          start: e.start,
          end: e.end,
          thumbnails: [
            thumbnails[0],
            thumbnails[Math.floor(thumbnails.length / 2)],
            thumbnails[thumbnails.length - 1],
          ],
        };
      });
      this.shots = results;
    },
  },
});
