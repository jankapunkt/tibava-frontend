import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
    namespaced: true,
    state: {
        timelineSegmentAnnotations: {},
        timelineSegmentAnnotationList: [],
    },
    getters: {
        all: (state) => {
            return state.timelineSegmentAnnotationList.map(id => state.timelineSegmentAnnotations[id])
        },
        forTimelineSegment: (state) => (timelineSegmentId) => {
            return state.timelineSegmentAnnotationList.map(id => state.timelineSegmentAnnotations[id]).filter(e => e.timeline_segment_id === timelineSegmentId)
        }
    },
    actions: {
        async create({ commit }, { timelineSegmentId, annotationId }) {
            const params = {
                timeline_segment_id: timelineSegmentId,
                annotation_id: annotationId
            }

            console.log(`TIMELINE_SEGMENT_ANNOTATION_CREATE ${JSON.stringify(params)}`);
            return axios.post(`${config.API_LOCATION}/timeline_segment_annotation_create`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {

                        commit('add', [res.data.entry]);

                        commit('timelineSegment/addAnnotation', [{ timelineSegmentId, entry: res.data.entry }], { root: true });
                        return res.data.entry.id;
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async delete({ commit }, id) {
            const params = {
                timeline_segment_annotation_id: id,
            }

            return axios.post(`${config.API_LOCATION}/timeline_segment_annotation_delete`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('delete', [res.data.entry]);
                        commit('timelineSegment/deleteAnnotation', [id], { root: true });
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async listUpdate({ commit }) {
            return axios.get(`${config.API_LOCATION}/timeline_segment_annotation_list`)
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
        async listAdd({ commit }, timeline_segment_id) {
            return axios.get(`${config.API_LOCATION}/timeline_segment_annotation_list`)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('add', res.data.entries);
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        // add({ commit }, { segment_hash_id, timelineSegmentAnnotation }) {
        //     const params = {
        //         hash_id: segment_hash_id,
        //         timelineSegmentAnnotation: timelineSegmentAnnotation
        //     }
        //     axios.post(`${config.API_LOCATION}/timelineSegmentAnnotation_add`, params)
        //         .then((res) => {
        //             if (res.data.status === 'ok') {
        //                 commit('addtimelineSegmentAnnotation', params);
        //             }
        //         })
        //         .catch((error) => {
        //             const info = { date: Date(), error, origin: 'collection' };
        //             commit('error/update', info, { root: true });
        //         });
        // },
        // delete({ commit }, timelineSegmentAnnotation_hash_id) {
        //     const params = {
        //         hash_id: timelineSegmentAnnotation_hash_id,
        //     }
        //     axios.post(`${config.API_LOCATION}/timelineSegmentAnnotation_delete`, params)
        //         .then((res) => {
        //             if (res.data.status === 'ok') {
        //                 commit('addtimelineSegmentAnnotation', params);
        //             }
        //         })
        //         .catch((error) => {
        //             const info = { date: Date(), error, origin: 'collection' };
        //             commit('error/update', info, { root: true });
        //         });
        // },
    },
    mutations: {
        add(state, timelineSegmentAnnotations) {
            timelineSegmentAnnotations.forEach((e, i) => {
                state.timelineSegmentAnnotations[e.id] = e
                state.timelineSegmentAnnotationList.push(e.id)
            });

        },
        update(state, timelineSegmentAnnotations) {
            state.timelineSegmentAnnotations = {}
            state.timelineSegmentAnnotationList = []
            timelineSegmentAnnotations.forEach((e, i) => {
                state.timelineSegmentAnnotations[e.id] = e
                state.timelineSegmentAnnotationList.push(e.id)
            });
        },
        delete(state, ids) {
            ids.forEach((id, i) => {
                let index = state.timelineSegmentAnnotationList.findIndex(f => f === id)
                state.timelineSegmentAnnotationList.splice(index, 1)
                delete state.timelineSegmentAnnotations[id]
            });

        },
        // delete(state, hash_id) {
        //     let timeline_index = state.timelines.findIndex(e => e.hash_id === timeline_hash_id);
        //     state.timelines.splice(timeline_index, 1);
        // },
    },
};
export default api;