import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'

export const usePluginRunResultStore = defineStore('pluginRunResult', {
    state: () => {
        return {
            pluginRunResults: {},
            pluginRunResultList: [],
        }
    },
    getters: {
        get: (state) => (id) => {
            return state.pluginRunResults[id];
        },
        forPlugin: (state) => (id) => {
            return state.pluginRunResults[id];
        },

        forPluginRun: (state) => (plugin_run_id) => {
            return state.pluginRunResultList
                .map((id) => state.pluginRunResults[id])
                .filter((e) => e.plugin_run_id === plugin_run_id);
        },
    },
    actions: {
        async fetchForVideo({ addResults = false, videoId = null }) {
            const params = {
                add_results: addResults,
            }

            //use video id or take it from the current video
            if (videoId) {
                params.video_id = videoId;
            } else {

                const playerStore = usePlayerStore();
                const videoId = playerStore.videoId;
                if (videoId) {
                    params.video_id = videoId;
                }
            }

            return axios.get(`${config.API_LOCATION}/plugin/run/result/list`, { params })
                .then((res) => {
                    if (res.data.status === 'ok') {
                        this.updateAll(res.data.entries);
                    }
                })
            // .catch((error) => {
            //   const info = { date: Date(), error, origin: 'collection' };
            //   commit('error/update', info, { root: true });
            // });
        },
        updateAll(pluginRunResults) {
            pluginRunResults.forEach((e, i) => {
                if (e.id in this.pluginRunResults) {
                    return;
                }
                this.pluginRunResults[e.id] = e;
                this.pluginRunResultList.push(e.id);
            });
        },
    },
})