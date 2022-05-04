import Vue from 'vue';
import axios from '../../plugins/axios';
import config from '../../../app.config';

const api = {
    namespaced: true,
    state: {
        pluginRunResults: {},
        pluginRunResultList: [],
    },
    getters: {
        get: (state) => (id) => {
            return state.pluginRunResults[id];
        },
    },
    actions: {

        async list({ commit }, { videoId, addResults }) {
            const params = {
                video_id: videoId,
                add_results: addResults,
            }
            return axios.get(`${config.API_LOCATION}/plugin/run/result/list`, { params })
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
        add(state, pluginRunResults) {
            pluginRunResults.forEach((e, i) => {
                state.pluginRunResults[e.id] = e
                state.pluginRunResultList.push(e.id)
            });
        },
        update(state, pluginRunResults) {
            state.pluginRunResults = {}
            state.pluginRunResultList = []
            pluginRunResults.forEach((e, i) => {
                state.pluginRunResults[e.id] = e
                state.pluginRunResultList.push(e.id)
            });
        },
    },
};
export default api;