import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'

import { useTimelineSegmentAnnotationStore } from '@/store/timeline_segment_annotation'
import { useAnnotationCategoryStore } from '@/store/annotation_category'
import { useAnnotationStore } from '@/store/annotation'

export const useTimelineSegmentStore = defineStore('timelineSegment', {
    state: () => {
        return {

            timelineSegments: {},
            timelineSegmentList: [],
            timelineSegmentSelectedList: [],
            timelineSegmentByTime: {}
        }
    },
    getters: {
        all: (state) => {
            return state.timelineSegmentList.map((id) => state.timelineSegments[id]);
        },
        forTimeline: (state) => (timeline_id) => {
            return state.timelineSegmentList
                .map((id) => state.timelineSegments[id])
                .filter((e) => e.timeline_id === timeline_id);
        },
        forTime: (state) => (current_time) => {
            return state.timelineSegmentList
                .map((id) => state.timelineSegments[id])
                .filter((e) => e.start <= current_time && e.end >= current_time);
        },
        get: (state) => (id) => {
            return state.timelineSegments[id];
        },
        selected: (state) => {
            return state.timelineSegmentSelectedList.map((id) => state.timelineSegments[id]);
        },
        forTimeLUT: (state) => (time) => {
            const timeSecond = Math.round(time)
            if (timeSecond in state.timelineSegmentByTime) {
                const timelineSegmentIds = state.timelineSegmentByTime[timeSecond];
                return timelineSegmentIds.map((id) => {
                    return state.timelineSegments[id]
                }
                );
            }
            return []
        }
    },
    actions: {
        clearSelection() {
            this.timelineSegmentSelectedList = []
            // this.timelineSegmentList.forEach((id) => {
            //     this.timelineSegments[id].selected = false;
            // })
        },
        addToSelection(timelineSegmentId) {
            this.timelineSegmentSelectedList.push(timelineSegmentId)
            // if (timelineSegmentId in this.timelineSegments) {
            //     this.timelineSegments[timelineSegmentId].selected = true;
            // }
        },
        removeFromSelection(timelineSegmentId) {

            let segment_index = this.timelineSegmentSelectedList.findIndex(
                (f) => f === timelineSegmentId
            );
            this.timelineSegmentSimelineSegmentList.splice(segment_index, 1);

            // if (timelineSegmentId in this.timelineSegments) {
            //     this.timelineSegments[timelineSegmentId].selected = false;
            // }
        },
        async annotate({ timelineSegmentId, annotations }) {
            const params = {
                timeline_segment_id: timelineSegmentId,
                annotations: annotations,
            };

            return axios
                .post(`${config.API_LOCATION}/timeline/segment/annotate`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        const timelineSegmentAnnotationStore = useTimelineSegmentAnnotationStore();
                        const annotationCategoryStore = useAnnotationCategoryStore();
                        const annotationStore = useAnnotationStore();

                        timelineSegmentAnnotationStore.deleteFromStore(res.data.timeline_segment_annotation_deleted
                        );
                        timelineSegmentAnnotationStore.addToStore(res.data.timeline_segment_annotation_added
                        );

                        annotationCategoryStore.addToStore(
                            res.data.annotation_category_added
                        );
                        annotationStore.addToStore(res.data.annotation_added);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async split({ timelineSegmentId, time }) {
            const params = {
                timeline_segment_id: timelineSegmentId,
                time: time,
            };
            return axios
                .post(`${config.API_LOCATION}/timeline/segment/split`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        commit(
                            "timelineSegmentAnnotation/delete",
                            res.data.timeline_segment_annotation_deleted,
                            { root: true }
                        );
                        commit(
                            "timelineSegmentAnnotation/add",
                            res.data.timeline_segment_annotation_added,
                            { root: true }
                        );
                        commit("delete", res.data.timeline_segment_deleted);
                        commit("add", res.data.timeline_segment_added);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async merge({ timelineSegmentIds }) {
            const params = {
                timeline_segment_ids: timelineSegmentIds,
            };
            return axios
                .post(`${config.API_LOCATION}/timeline/segment/merge`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        commit(
                            "timelineSegmentAnnotation/delete",
                            res.data.timeline_segment_annotation_deleted,
                            { root: true }
                        );
                        commit(
                            "timelineSegmentAnnotation/add",
                            res.data.timeline_segment_annotation_added,
                            { root: true }
                        );
                        commit("delete", res.data.timeline_segment_deleted);
                        commit("add", res.data.timeline_segment_added);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async fetchForVideo({ timelineId, videoId }) {
            let params = {};
            if (timelineId) {
                params.timeline_id = timelineId;
            }
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
                .get(`${config.API_LOCATION}/timeline/segment/list`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceAll(res.data.entries);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        addAnnotation(annotations) {
            annotations.forEach((e) => {
                this.timelineSegments[e.timelineSegmentId].annotation_ids.push(
                    e.entry.id
                );
            });
        },
        deleteAnnotation(timeline_segment_annotations) {
            timeline_segment_annotations.forEach((f) => {
                this.timelineSegmentList
                    .map((id) => this.timelineSegments[id])
                    .forEach((e) => {
                        let index = e.annotation_ids.findIndex((k) => k === f);
                        if (index >= 0) {
                            e.annotation_ids.splice(index, 1);
                        }
                    });
            });
        },
        add(timelineSegments) {
            timelineSegments.forEach((e, i) => {
                this.timelineSegments[e.id] = e;
                this.timelineSegmentList.push(e.id);
            });
            timelineSegments = timelineSegments.sort((a, b) => {
                return a.start - b.start;
            });
            this.updateTimeStore()
        },
        delete(ids) {
            ids.forEach((id, i) => {
                let index = this.timelineSegmentList.findIndex((f) => f === id);
                this.timelineSegmentList.splice(index, 1);
                delete this.timelineSegments[id];
            });
            this.updateTimeStore()
        },
        replaceAll(timelineSegments) {
            this.timelineSegmentList = [];
            this.timelineSegments = {};
            timelineSegments = timelineSegments.sort((a, b) => {
                return a.start - b.start;
            });
            timelineSegments.forEach((e, i) => {
                this.timelineSegments[e.id] = e;
                this.timelineSegmentList.push(e.id);
            });
            this.clearSelection()
            this.updateTimeStore()
        },
        // delete(this, timeline_id) {
        //     let timeline_index = this.timelines.findIndex(e => e.id === timeline_id);
        //     this.timelines.splice(timeline_index, 1);
        // },

        clear() {
            this.timelineSegmentList = [];
            this.timelineSegments = {};
            this.clearSelection()
            this.updateTimeStore()
        },
        deleteTimeline(timeline_id) {
            const timeline_indexes = this.timelineSegmentList
                .map((id) => this.timelineSegments[id])
                .filter((e) => e.timeline_id === timeline_id);
            timeline_indexes.forEach((e) => {
                let segment_index = this.timelineSegmentList.findIndex(
                    (f) => f === e.id
                );
                this.timelineSegmentList.splice(segment_index, 1);
                delete this.timelineSegments[e.id];
            });
            this.updateTimeStore()
        },

        updateTimeStore() {
            this.all.forEach((e) => {
                for (var i = Math.floor(e.start); i < Math.ceil(e.end); i++) {
                    if (i in this.timelineSegmentByTime) {
                        this.timelineSegmentByTime[i].push(e.id)

                    }
                    else {
                        this.timelineSegmentByTime[i] = [e.id]
                    }
                }
            })
        }
    },
})