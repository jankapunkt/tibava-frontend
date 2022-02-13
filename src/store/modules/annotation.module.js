import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
    namespaced: true,
    state: {
        annotations: {},
        annotationList: [],
    },
    getters: {
        all: (state) => {
            return state.annotationList.map(id => state.annotations[id])
        },
        get: (state) => (id) => {
            return state.annotations[id]
        }
    },
    actions: {
        async create({ commit }, { name, color, categoryId }) {
            const params = {
                name: name,
                color: color
            }
            if (categoryId) {
                params["category_id"] = categoryId
            }

            return axios.post(`${config.API_LOCATION}/annotation_create`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('add', [res.data.entry]);
                        return res.data.entry.id;
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async change({ commit }, { annotationId, name, color, categoryId }) {
            const params = {
                annotation_id: annotationId,
                color: color,
                name: name
            }
            if (categoryId) {
                params["category_id"] = categoryId
            }

            return axios.post(`${config.API_LOCATION}/annotation_change`, params)
                .then((res) => {
                    console.log(res.data)
                    if (res.data.status === 'ok') {

                        commit('change', [{ id: annotationId, color: color, name: name, category_id: categoryId }]);
                        // return res.data.entry.id;
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        // listAdd({ commit }, segment_hash_id) {
        //     const params = {
        //         hash_id: segment_hash_id,
        //         annotation: annotation
        //     }
        //     axios.post(`${config.API_LOCATION}/annotation_list`, params)
        //         .then((res) => {
        //             if (res.data.status === 'ok') {
        //                 commit('add', params);
        //             }
        //         })
        //         .catch((error) => {
        //             const info = { date: Date(), error, origin: 'collection' };
        //             commit('error/update', info, { root: true });
        //         });
        // },
        listUpdate({ commit }) {
            axios.get(`${config.API_LOCATION}/annotation_list`)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('update', res.data.entries);
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        // add({ commit }, { segment_hash_id, annotation }) {
        //     const params = {
        //         hash_id: segment_hash_id,
        //         annotation: annotation
        //     }
        //     axios.post(`${config.API_LOCATION}/annotation_add`, params)
        //         .then((res) => {
        //             if (res.data.status === 'ok') {
        //                 commit('addAnnotation', params);
        //             }
        //         })
        //         .catch((error) => {
        //             const info = { date: Date(), error, origin: 'collection' };
        //             commit('error/update', info, { root: true });
        //         });
        // },
        // delete({ commit }, annotation_hash_id) {
        //     const params = {
        //         hash_id: annotation_hash_id,
        //     }
        //     axios.post(`${config.API_LOCATION}/annotation_delete`, params)
        //         .then((res) => {
        //             if (res.data.status === 'ok') {
        //                 commit('addAnnotation', params);
        //             }
        //         })
        //         .catch((error) => {
        //             const info = { date: Date(), error, origin: 'collection' };
        //             commit('error/update', info, { root: true });
        //         });
        // },
    },
    mutations: {
        change(state, annotations) {
            const newAnnotations = { ...state.annotations };
            console.log('Change')
            annotations.forEach((e, i) => {
                Vue.set(newAnnotations, e.id, e)
            });
            state.annotations = newAnnotations;
        },
        add(state, annotations) {
            annotations.forEach((e, i) => {
                state.annotations[e.id] = e
                state.annotationList.push(e.id)
            });
        },
        update(state, annotations) {
            state.annotations = {}
            state.annotationList = []
            annotations.forEach((e, i) => {
                state.annotations[e.id] = e
                state.annotationList.push(e.id)
            });
        },
        // delete(state, hash_id) {
        //     let timeline_index = state.timelines.findIndex(e => e.hash_id === timeline_hash_id);
        //     state.timelines.splice(timeline_index, 1);
        // },
    },
};
export default api;