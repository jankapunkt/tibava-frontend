import Vue from 'vue';
import router from '../../router';
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
    video: {video_id: null},
    videos: [],
    lang: "en" 
  },
  actions: {
    analyse_video({commit, state}, video_id) {
      console.log(video_id);
      console.log(commit);
      console.log("###")
      console.log(state)
      router.push({path: "videoanalysis"});
      commit("update_video_id", video_id);
    },

    upload({ commit }, params) {
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append('title', params.title);
      formData.append('license', params.license);

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
  },
  mutations: {
    update_video_id(state, video_id) {
      state.video.video_id = video_id;
    },
    add(state, video){
      state.videos.push(video);
    },
    update(state, videos){
      state.videos=videos;
    }

  },
};
export default api;