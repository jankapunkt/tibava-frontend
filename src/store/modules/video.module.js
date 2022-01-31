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
    video: {},
    videos: [],
    lang: "en" 
  },
  actions: {
    show({commit, state}, video_hash_id) {
      
      const params = {
        hash_id: video_hash_id
      }
      axios.get(`${config.API_LOCATION}/video_get`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
              console.log(res.data.entry);
              commit("show", res.data.entry);
              router.push({path: "videoanalysis"});
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
      console.log(params.analyser);
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
    delete({commit, state}, video_hash_id) {
      const params = {
        hash_id: video_hash_id
      }
      console.log(params);
      axios.post(`${config.API_LOCATION}/video_delete`, { hash_id: video_hash_id })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit("delete",video_hash_id);
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
    add(state, video){
      state.videos.push(video);
    },
    update(state, videos){
      state.videos=videos;
    },
    delete(state, video_hash_id){
      state.videos.splice(state.videos.findIndex(e => e.hash_id === video_hash_id),1);
    },
    show(state, video){
      state.video=video;
    }

  },
};
export default api;