import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'
import { usePlayerStore } from '@/store/player'

export const usePluginRunStore = defineStore('pluginRun', {
    state: () => {
        return {
            pluginRuns: {},
            pluginRunList: [],
            isLoading: false,
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
                const video = playerStore.videoId;
                if (video) {
                    params.video_id = video;
                }
            }

            return axios.post(`${config.API_LOCATION}/plugin/run/new`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
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
                return
            }
            this.isLoading = true

            let params = { add_results: addResults };
            return axios
                .get(`${config.API_LOCATION}/plugin/run/list`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.updateAll(res.data.entries)
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async fetchForVideo({ addResults = false, videoId = null }) {
            if (this.isLoading) {
                return
            }
            this.isLoading = true

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
                        this.updateAll(res.data.entries)
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        clearStore() {
            this.pluginRuns = {}
            this.pluginRunList = []
        },
        updateAll(pluginRuns) {
            pluginRuns.forEach((e, i) => {

                if (e.id in this.pluginRuns) {
                    return;
                }
                this.pluginRuns[e.id] = e;
                this.pluginRunList.push(e.id);
            });
        },
    },
})