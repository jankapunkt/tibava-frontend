import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";
import { defineStore } from "pinia";
import { usePlayerStore } from "@/store/player";

export const usePluginRunStore = defineStore("pluginRun", {
  state: () => {
    return {
      pluginRuns: {},
      pluginRunList: [],
      isLoading: false,
      pluginInProgress: false,
    };
  },
  getters: {
    forVideo: (state) => {
      return (videoId) => {
        return state.pluginRunList
          .map((id) => state.pluginRuns[id])
          .filter((e) => e.video_id === videoId);
      };
    },
  },
  actions: {
    async submit({ plugin, parameters = [], videoId = null }) {
      const formData = new FormData();
      formData.append("plugin", plugin);
      let jsonParameters = []
      formData.append("parameters", JSON.stringify(parameters));
      parameters.forEach((p) => {
        if ("file" in p) {
          formData.append(`file_${p.name}`, p.file);
        }
        else {
          jsonParameters.push(p);
        }
      })
      formData.append("parameters", JSON.stringify(jsonParameters));

      //use video id or take it from the current video
      let video_id = videoId;
      if (videoId) {
        video_id = videoId;
      } else {
        const playerStore = usePlayerStore();
        const video = playerStore.videoId;
        if (video) {
          video_id = video;
        }
      }
      formData.append("video_id", video_id);

      return axios
        .post(`${config.API_LOCATION}/plugin/run/new`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          if (res.data.status === "ok") {
            this.pluginInProgress = true;
            // commit('update', res.data.entries);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
      // .catch((error) => {
      //   const info = { date: Date(), error, origin: 'collection' };
      //   commit('error/update', info, { root: true });
      // });
    },
    async fetchAll({ addResults = false }) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = { add_results: addResults };
      return axios
        .get(`${config.API_LOCATION}/plugin/run/list`, { params })
        .then((res) => {
          if (res.data.status === "ok") {
            this.updateAll(res.data.entries);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    async fetchForVideo({ addResults = false, videoId = null }) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = { add_results: addResults };
      if (videoId) {
        params.video_id = videoId;
      } else {
        const playerStore = usePlayerStore();
        const videoId = playerStore.videoId;
        if (videoId) {
          params.video_id = videoId;
        }
      }
      return axios
        .get(`${config.API_LOCATION}/plugin/run/list`, { params })
        .then((res) => {
          if (res.data.status === "ok") {
            this.updateAll(res.data.entries);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    async fetchUpdateForVideo({ addResults = false, videoId = null }) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = { add_results: addResults };
      if (videoId) {
        params.video_id = videoId;
      } else {
        const playerStore = usePlayerStore();
        const videoId = playerStore.videoId;
        if (videoId) {
          params.video_id = videoId;
        }
      }
      return axios
        .get(`${config.API_LOCATION}/plugin/run/list`, { params })
        .then((res) => {
          if (res.data.status === "ok") {
            console.log(res.data);
            this.updateAll(res.data.entries);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    clearStore() {
      this.pluginRuns = {};
      this.pluginRunList = [];
    },
    updateAll(pluginRuns) {
      pluginRuns.forEach((e, i) => {
        if (e.id in this.pluginRuns) {
          const newPluginRuns = { ...this.pluginRuns };
          newPluginRuns[e.id] = e;
          Vue.set(this, "pluginRuns", newPluginRuns);

          // if (e.status !== "DONE") {
          //   console.log("set");
          //   console.log(e);
          //   console.log(this.pluginRuns[e.id]);
          // }
          return;
        }

        this.pluginRuns[e.id] = e;
        this.pluginRunList.push(e.id);
      });
    },
  },
});
