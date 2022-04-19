import Vue from "vue";
import router from "../../router";
import axios from "../../plugins/axios";
import config from "../../../app.config";
import { isEqual, lsplit, keyInObj } from "../../plugins/helpers";

const api = {
  namespaced: true,
  state: {
    shortcuts: {},
    shortcutList: [],
  },
  getters: {
    all: (state) => {
      return state.shortcutList.map((id) => state.shortcuts[id]);
    },
    get: (state) => (id) => {
      return state.shortcuts[id];
    },
  },
  actions: {
    async create({ commit }, { key, videoId = null }) {
      const params = {
        key: key,
      };
      if (videoId) {
        params.video_id = videoId;
      } else {
        const video = this.getters["video/current"];
        if (video) {
          params.video_id = video.id;
        }
      }

      console.log(`ANNOTATION_SHORTCUT_CREATE ${JSON.stringify(params)}`);
      return axios
        .post(`${config.API_LOCATION}/shortcut/create`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            commit("add", [res.data.entry]);
            return res.data.entry.id;
          }
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'collection' };
      //     commit('error/update', info, { root: true });
      // });
    },
    async listUpdate({ commit }, { videoId = null }) {
      let params = {};

      //use video id or take it from the current video
      if (videoId) {
        params.video_id = videoId;
      } else {
        const video = this.getters["video/current"];
        if (video) {
          params.video_id = video.id;
        }
      }
      console.log(`shortcut::listUpdate ${JSON.stringify(params)}`);
      return axios
        .get(`${config.API_LOCATION}/shortcut/list`, { params })
        .then((res) => {
          if (res.data.status === "ok") {
            commit("update", res.data.entries);
          }
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'collection' };
      //     commit('error/update', info, { root: true });
      // });
    },
  },
  mutations: {
    add(state, categories) {
      categories.forEach((e, i) => {
        state.shortcuts[e.id] = e;
        state.shortcutList.push(e.id);
      });
    },
    update(state, categories) {
      state.shortcuts = {};
      state.shortcutList = [];
      categories.forEach((e, i) => {
        state.shortcuts[e.id] = e;
        state.shortcutList.push(e.id);
      });
    },
  },
};
export default api;
