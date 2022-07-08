import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'

export const usePluginRunStore = defineStore('pluginRun', {
    state: () => {
        return {
            pluginRuns: {},
            pluginRunList: [],
        }
    },
    getters: {
        forVideo: (state) => {
            return (videoId) => {
                return state.pluginRunList.map(id => state.pluginRuns[id]).filter(e => e.video_id === videoId)
            }
        }
    },
    actions: {
        async submit({ plugin, parameters = [], videoId = null }) {
            const params = {
                plugin: plugin,
                parameters: parameters,
            }

            //use video id or take it from the current video
            if (videoId) {
                params.video_id = videoId;
            } else {
                const playerStore = usePlayerStore();
                const video = playerStore.video();
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
        async fetchAll({ addResults = false }) {

            let params = { add_results: addResults };
            return axios
                .get(`${config.API_LOCATION}/plugin/run/list`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceAll(res.data.entries)
                    }
                })
        },
        async fetchForVideo({ addResults = false, videoId = null }) {
            let params = { add_results: addResults };
            if (videoId) {
                params.video_id = videoId;

            } else {

                const playerStore = usePlayerStore();
                const video = playerStore.video();
                if (video) {
                    params.video_id = video.id;
                }
            }
            return axios
                .get(`${config.API_LOCATION}/plugin/run/list`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceAll(res.data.entries)
                    }
                })
        },
        replaceAll(pluginRuns) {
            this.pluginRuns = {};
            this.pluginRunList = [];
            pluginRuns.forEach((e, i) => {
                this.pluginRuns[e.id] = e;
                this.pluginRunList.push(e.id);
            });
        },
    },
})