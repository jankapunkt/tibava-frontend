import Vue from 'vue';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
  namespaced: true,
  state: {
    current: {},
    videos: {},
    videoList: [],
    lang: "en",
    upload:{
      isUploading:false,
      progress:0.0,
    }
  },
  getters: {
    all: (state) => {
      return state.videoList.map(id => state.videos[id])
    },
    get: (state) => (id) => {
        return state.videos[id]
    },
    current: (state) => {
        return state.current
    }
  },
  actions: {
    async get({ commit, state }, {videoId}) {
      const params = {
        id: videoId
      }
      return axios.get(`${config.API_LOCATION}/video_get`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit("updateCurrent", res.data.entry);
          }
        })
        // .catch((error) => {
        //   const info = { date: Date(), error, origin: 'collection' };
        //   commit('error/update', info, { root: true });
        // });
    },
    async fetch({commit}, {videoId, includeTimeline=true, includeAnnotation=true, includeAnalyser=true}){

      let promises = []

      promises.push(this.dispatch("video/get", {videoId}))
      if(includeAnnotation){
        promises.push(this.dispatch("annotationCategory/listUpdate", {videoId}))
        promises.push(this.dispatch("annotation/listUpdate", {videoId}))
      }
      if(includeTimeline){
        promises.push(this.dispatch("timeline/listUpdate", {videoId}))
        promises.push(this.dispatch("timelineSegment/listUpdate", {videoId}))
        promises.push(this.dispatch("timelineSegmentAnnotation/listUpdate", {videoId}))
      }
      if(includeAnalyser){
        promises.push(this.dispatch("analyser/listUpdate", {
          videoId: videoId,
          addResults: true,
        }));
      }
      return Promise.all(promises)
    },

    async upload({ commit }, params) {
      const formData = new FormData();
      formData.append('file', params.video.file);
      formData.append('title', params.video.title);
      formData.append('license', params.video.license);
      formData.append('analyser', params.analyser);
      commit("startUploading");
      // commit('loading/update', true, { root: true });
      return axios.post(`${config.API_LOCATION}/video_upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) =>{console.log(JSON.stringify(event))
          const totalLength = event.lengthComputable ? event.total : event.target.getResponseHeader('content-length') || event.target.getResponseHeader('x-decompressed-content-length');
          console.log("onUploadProgress", totalLength);
          if (totalLength !== null) {
              const progress =Math.round( (event.loaded * 100) / totalLength );
              commit("updateUploading",progress);
          }
        }
      })
        .then((res) => {
          console.log(res);
          if (res.data.status === 'ok') {
            res.data.entries.forEach((entry) => {
              commit('add', entry);
            });
          }

          commit("stopUploading");
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'upload' };
          commit('error/update', info, { root: true });
          commit("stopUploading");
        });
    },
    async listUpdate({ commit }, params) {
      return axios.get(`${config.API_LOCATION}/video_list`)
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
    async delete({ commit, state }, video_id) {
      const params = {
        id: video_id
      }
      return axios.post(`${config.API_LOCATION}/video_delete`, { id: video_id })
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

    add(state, videos) {
      videos.forEach((e, i) => {
          state.videos[e.id] = e
          state.videoList.push(e.id)
      });
    },
    update(state, videos) {
        state.videos = {}
        state.videoList = []
        videos.forEach((e, i) => {
            state.videos[e.id] = e
            state.videoList.push(e.id)
        });
    },
    delete(state, video_id) {
      state.videos.splice(state.videos.findIndex(e => e.id === video_id), 1);
    },
    updateCurrent(state, video) {
      state.current = video;
    },
    startUploading(state){
      state.upload.isUploading = true;
    },
    updateUploading(state, progress){
      state.upload.progress = progress;
    },
    stopUploading(state){
      state.upload.isUploading = false;

    },
  },
};
export default api;