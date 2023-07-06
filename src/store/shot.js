import config from "../../app.config";
import { defineStore } from "pinia";

import { usePlayerStore } from "./player";
import { usePluginRunStore } from "./plugin_run";
import { usePluginRunResultStore } from "./plugin_run_result";

export const useShotStore = defineStore("shot", {
  getters: {
    shots (state) {
      const pluginRunStore = usePluginRunStore();
      const pluginRunResultStore = usePluginRunResultStore();
      const playerStore = usePlayerStore();

      // selection of timeline to be used for the thumbnails
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
      shotdetection = shotdetection.at(-1); // use latest shotdetection

      // selection of thumbnails to be used
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
      thumbnail = thumbnail.at(-1); // use latest thumbnails

      // get start and end times for each shot
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

      // create thumbnail dict indicating the thumbnail for a specific time
      let thumbnail_list = [];
      let delta_time = 0.2;
      if (
        "results" in thumbnail &&
        thumbnail.results.length > 0 &&
        "data" in thumbnail.results[0]
      ) {
        delta_time = thumbnail.results[0].data.images[0].delta_time;
        thumbnail_list = thumbnail.results[0].data.images.map((e) => {
          return (
            config.THUMBNAIL_LOCATION +
            `/${e.id.substr(0, 2)}/${e.id.substr(2, 2)}/${e.id}.${e.ext}`
          );
        });
      }

      // assign thumbnails to shots
      results = results.map((e, i) => {
        return {
          id: i + 1,
          start: e.start,
          end: e.end,
          thumbnails: [
            thumbnail_list[
              Math.min(
                Math.ceil(e.start / delta_time),
                thumbnail_list.length - 1
              )
            ],
            thumbnail_list[
              Math.round((e.start + (e.end - e.start) / 2) / delta_time)
            ],
            thumbnail_list[Math.floor(e.end / delta_time)],
          ],
        };
      });

      return results;
      }
    }
  },
);
