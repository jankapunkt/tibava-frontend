import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
    namespaced: true,
    state: {
        timelineSegments: {},
        timelineSegmentList: [],
    },
    getters: {
        forTimeline: (state) => (timeline_id) => {
            return state.timelineSegmentList.map(id => state.timelineSegments[id]).filter(e => e.timeline_id === timeline_id)
        },
        get: (state) => (id) => {
            return state.timelineSegments[id];
        }
    },
    actions: {

        async annotate({ commit }, { timelineSegmentId, annotations }) {
            const params = {
                timeline_segment_id: timelineSegmentId,
                annotations: annotations
            }

            const videoId = this.getters["video/current"].id;


            console.log(`TIMELINE_SEGMENT_ANNOTATE ${JSON.stringify(params)} ${videoId}`);
            return axios.post(`${config.API_LOCATION}/timeline/segment/annotate`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        this.dispatch("annotationCategory/listUpdate", {videoId})
                        this.dispatch("annotation/listUpdate", {videoId})
                        
                        this.dispatch("timeline/listUpdate", {videoId})
                        this.dispatch("timelineSegment/listUpdate", {videoId})
                        this.dispatch("timelineSegmentAnnotation/listUpdate", {videoId})
                          
                        // commit('add', [res.data.entry]);

                        // commit('timelineSegment/addAnnotation', [{ timelineSegmentId, entry: res.data.entry }], { root: true });
                        // return res.data.entry.id;
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async listAdd({ commit }, timeline_id) {
            const params = {
                timeline_id: timeline_id
            }
            return axios.get(`${config.API_LOCATION}/timeline/segment/list`, { params })
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

        async listUpdate({ commit }, {timelineId, videoId}) {
            let params = {}
            if(timelineId){
                params.timeline_id = timelineId
            }
            if(videoId){
                params.video_id = videoId;
            }
            else{
                const video = this.getters["video/current"];
                if(video){
                    params.video_id = video.id
                }
            }
            return axios.get(`${config.API_LOCATION}/timeline/segment/list`, { params })
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


    },
    mutations: {
        addAnnotation(state, annotations) {
            annotations.forEach((e) => {
                state.timelineSegments[e.timelineSegmentId].annotation_ids.push(e.entry.id)
            });
        },
        deleteAnnotation(state, timeline_segment_annotations) {

            timeline_segment_annotations.forEach((f) => {
                state.timelineSegmentList.map(id => state.timelineSegments[id]).forEach((e) => {
                    let index = e.annotation_ids.findIndex((k) => k === f)
                    if (index >= 0) {
                        e.annotation_ids.splice(index, 1);
                    }
                })
            })
        },
        add(state, timelineSegments) {
            timelineSegments.forEach((e, i) => {
                state.timelineSegments[e.id] = e
                state.timelineSegmentList.push(e.id)
                // this.dispatch("timelineSegmentAnnotation/listAdd", e.id);
            });
        },
        update(state, timelineSegments) {
            this.timelineSegmentList = [];
            this.timelineSegments = {};
            timelineSegments.forEach((e, i) => {
                state.timelineSegments[e.id] = e
                state.timelineSegmentList.push(e.id)
                // this.dispatch("timelineSegmentAnnotation/listAdd", e.id);
            });
        },
        // delete(state, timeline_id) {
        //     let timeline_index = state.timelines.findIndex(e => e.id === timeline_id);
        //     state.timelines.splice(timeline_index, 1);
        // },

        clear(state) {
            this.timelineSegmentList = [];
            this.timelineSegments = {};
        },
        deleteTimeline(state, timeline_id) {
            const timeline_indexes = state.timelineSegmentList.map(id => state.timelineSegments[id]).filter(e => e.timeline_id === timeline_id)
            timeline_indexes.forEach(e => {
                let segment_index = state.timelineSegmentList.findIndex(f => f === e.id);
                state.timelineSegmentList.splice(segment_index, 1);
                delete state.timelineSegments[e.id]
            });
        },
    },
};
export default api;