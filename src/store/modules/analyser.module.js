import Vue from 'vue';
import axios from '../../plugins/axios';
import config from '../../../app.config';

const api = {
  namespaced: true,
  state: {
    analysers: {},
    analyserList: [],
  },
  getters:{
    forVideo: (state) => (videoId) => {
      return state.analyserList.map(id => state.analysers[id]).filter(e => e.video_id === videoId)
  }
  },
  actions: {
    async listUpdate({ commit }, {videoId, addResults}) {
      const params = {
        video_id: videoId,
        add_results: addResults,
      }
      return axios.get(`${config.API_LOCATION}/analyser/list`, { params })
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
    add(state, analysers) {
        analysers.forEach((e, i) => {
            state.analysers[e.id] = e
            state.analyserList.push(e.id)
        });
    },
    update(state, analysers) {
        state.analysers = {}
        state.analyserList = []
        analysers.forEach((e, i) => {
            state.analysers[e.id] = e
            state.analyserList.push(e.id)
        });
    },
  },
};
export default api;