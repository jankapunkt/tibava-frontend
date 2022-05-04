import Vue from 'vue';
import axios from '../../plugins/axios';
import config from '../../../app.config';

const api = {
  namespaced: true,
  state: {
    pluginRuns: {},
    pluginRunList: [],
  },
  getters: {
    forVideo: (state) => (videoId) => {
      return state.pluginRunList.map(id => state.pluginRuns[id]).filter(e => e.video_id === videoId)
    }
  },
  actions: {
    async new({ commit }, { plugin, videoId = null }) {
      const params = {
        plugin: plugin,
      }

      //use video id or take it from the current video
      if (videoId) {
        params.video_id = videoId;
      } else {
        const video = this.getters["video/current"];
        if (video) {
          params.video_id = video.id;
        }
      }

      return axios.post(`${config.API_LOCATION}/plugin/run/new`, params)
        .then((res) => {
          if (res.data.status === 'ok') {
            // commit('update', res.data.entries);
          }
        })
      // .catch((error) => {
      //   const info = { date: Date(), error, origin: 'collection' };
      //   commit('error/update', info, { root: true });
      // });
    },
    async listUpdate({ commit }, { videoId, addResults }) {
      const params = {
        video_id: videoId,
        add_results: addResults,
      }
      return axios.get(`${config.API_LOCATION}/plugin/run/list`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit('update', res.data.entries);
          }
        })
      // .catch((error) => {
      //   const info = { date: Date(), error, origin: 'collection' };
      //   commit('error/update', info, { root: true });
      // });
    },
  },
  mutations: {
    add(state, pluginRuns) {
      pluginRuns.forEach((e, i) => {
        state.pluginRuns[e.id] = e
        state.pluginRunList.push(e.id)
      });
    },
    update(state, pluginRuns) {
      state.pluginRuns = {}
      state.pluginRunList = []
      pluginRuns.forEach((e, i) => {
        state.pluginRuns[e.id] = e
        state.pluginRunList.push(e.id)
      });
    },
  },
};
export default api;