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
    }
  },
  mutations: {
    update_video_id(state, video_id) {
      state.video.video_id = video_id
    }
  },
};
export default api;