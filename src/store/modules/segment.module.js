import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
    namespaced: true,
    state: {
        segments: {},
        segmentList: [],
    },
    getters: {
        forVideo: (state) => (video_hash_id) => {
            return state.timelineList.map(hash_id => state.timelines[hash_id]).filter(e => e.video_hash_id === video_hash_id)
        }
    },
    actions: {

        listAdd({ commit }, timeline_hash_id) {
            const params = {
                hash_id: video_hash_id
            }
            axios.get(`${config.API_LOCATION}/timeline_list`, { params })
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

        listUpdate({ commit }, video_hash_id) {
            const params = {
                hash_id: video_hash_id
            }
            axios.get(`${config.API_LOCATION}/timeline_list`, { params })
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


        duplicate({ commit }, timeline_hash_id) {

            const params = {
                hash_id: timeline_hash_id
            }
            axios.post(`${config.API_LOCATION}/timeline_duplicate`, params)
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

        delete({ commit }, timeline_hash_id) {

            const params = {
                hash_id: timeline_hash_id
            }
            axios.post(`${config.API_LOCATION}/timeline_delete`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit("delete", timeline_hash_id);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'collection' };
                    commit('error/update', info, { root: true });
                });
        },
    },
    mutations: {
        addAnnotation(state, { hash_id, annotation }) {
            // TODO
            // let timeline_id = null;
            // let segment_id = null;
            // state.timelines.forEach((e, i) => {
            //     e.segments.forEach((f, j) => {
            //         if (f.hash_id == hash_id) {
            //             timeline_id = i
            //             segment_id = j
            //         }
            //     })
            // })
            // let timelines = state.timelines;
            // timelines[timeline_id].segments[segment_id].labels.push(annotation)
            state.timelines = []
            console.log(JSON.stringify(state.timelines))
        },
        add(state, timeline) {
            state.timelines.push(timeline);
        },
        // duplicate(state, { old_hash_id, new_hash_id }) {
        //     timeline_index = state.timelines.findIndex(e => e.hash_id === old_hash_id);

        //     state.timelines.push(state.timelines[timeline_index]);
        // },
        update(state, timelines) {
            timelines.forEach((e, i) => {
                state.timelines[e.hash_id] = e
                state.timelineList.push(e.hash_id)
            });
        },
        delete(state, timeline_hash_id) {
            let timeline_index = state.timelines.findIndex(e => e.hash_id === timeline_hash_id);
            state.timelines.splice(timeline_index, 1);
        },
    },
};
export default api;