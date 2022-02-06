import Vue from 'vue';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

function generateRandomStr(length) {
  var result = [];
  var characters = 'abcdef0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() *
      charactersLength)));
  }
  return result.join('');
}
const api = {
  namespaced: true,
  state: {
    current: {},
    videos: [],
    lang: "en"
  },
  actions: {
    async get({ commit, state }, video_id) {
      const params = {
        id: video_id
      }
      axios.get(`${config.API_LOCATION}/video_get`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit("change_current", res.data.entry);
          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'collection' };
          commit('error/update', info, { root: true });
        });
    },

    upload({ commit }, params) {
      const formData = new FormData();
      formData.append('file', params.video.file);
      formData.append('title', params.video.title);
      formData.append('license', params.video.license);
      formData.append('analyser', params.analyser);
      // commit('loading/update', true, { root: true });
      axios.post(`${config.API_LOCATION}/video_upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((res) => {
          console.log(res);
          if (res.data.status === 'ok') {
            res.data.entries.forEach((entry) => {
              commit('add', entry);
            });
          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'upload' };
          commit('error/update', info, { root: true });
        });
    },
    list({ commit }, params) {
      axios.get(`${config.API_LOCATION}/video_list`)
        .then((res) => {
          if (res.data.status === 'ok') {
            commit('update', res.data.entries);

          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'collection' };
          commit('error/update', info, { root: true });
        });
    },
    delete({ commit, state }, video_id) {
      const params = {
        id: video_id
      }
      axios.post(`${config.API_LOCATION}/video_delete`, { id: video_id })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit("delete", video_id);
            //TODO
          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'collection' };
          commit('error/update', info, { root: true });
        });

    },
  },
  mutations: {
    add(state, video) {
      state.videos.push(video);
    },
    update(state, videos) {
      state.videos = videos;
    },
    delete(state, video_id) {
      state.videos.splice(state.videos.findIndex(e => e.id === video_id), 1);
    },
    change_current(state, video) {
      state.current = video;
    }

  },
};
export default api;