import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
    namespaced: true,
    state: {
        timelines: {},
        timelineList: [],
    },
    getters: {
        forVideo: (state) => (video_id) => {
            return state.timelineList.map(id => state.timelines[id]).filter(e => e.video_id === video_id)
        }
    },
    actions: {
        async listAdd({ commit }, video_id) {
            const params = {
                id: video_id
            }
            return axios.get(`${config.API_LOCATION}/timeline_list`, { params })
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('add', res.data.entries);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'collection' };
                    commit('error/update', info, { root: true });
                });
        },

        async listUpdate({ commit }, video_id) {
            const params = {
                id: video_id
            }
            return axios.get(`${config.API_LOCATION}/timeline_list`, { params })
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


        async duplicate({ commit }, timeline_id) {

            const params = {
                id: timeline_id
            }
            return axios.post(`${config.API_LOCATION}/timeline_duplicate`, params)
                .then((res) => {
                    console.log(res.data);
                    if (res.data.status === 'ok') {
                        commit('add', res.data.entry);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'upload' };
                    commit('error/update', info, { root: true });
                });
        },

        async delete({ commit }, timeline_id) {

            const params = {
                id: timeline_id
            }
            return axios.post(`${config.API_LOCATION}/timeline_delete`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit("delete", timeline_id);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'collection' };
                    commit('error/update', info, { root: true });
                });
        },
    },
    mutations: {
        add(state, timeline) {
            timelines.forEach((e, i) => {
                state.timelines[e.id] = e
                state.timelineList.push(e.id)
            });
        },
        // duplicate(state, { old_id, new_id }) {
        //     timeline_index = state.timelines.findIndex(e => e.id === old_id);

        //     state.timelines.push(state.timelines[timeline_index]);
        // },
        update(state, timelines) {
            state.timelines = {};
            state.timelineList = [];
            timelines.forEach((e, i) => {
                state.timelines[e.id] = e
                state.timelineList.push(e.id)
            });
            console.log('Timeline update')
        },
        delete(state, timeline_id) {
            let timeline_index = state.timelines.findIndex(e => e.id === timeline_id);
            state.timelines.splice(timeline_index, 1);
        },
    },
};
export default api;