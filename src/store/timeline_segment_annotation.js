import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'

export const useTimelineSegmentAnnotationStore = defineStore('timelineSegmentAnnotation', {
    state: () => {
        return {
            timelineSegmentAnnotations: {},
            timelineSegmentAnnotationByTime: {},
            timelineSegmentAnnotationList: [],
        }
    },
    getters: {
        all: (state) => {
            return state.timelineSegmentAnnotationList.map(
                (id) => state.timelineSegmentAnnotations[id]
            );
        },
        forTimelineSegment: (state) => (timelineSegmentId) => {
            return state.timelineSegmentAnnotationList
                .map((id) => state.timelineSegmentAnnotations[id])
                .filter((e) => e.timeline_segment_id === timelineSegmentId);
        },
    },
    actions: {
        async create({ timelineSegmentId, annotationId }) {
            const params = {
                timeline_segment_id: timelineSegmentId,
                annotation_id: annotationId,
            };

            const timelineSegmentStore = useTimelineSegmentStore()

            return axios
                .post(
                    `${config.API_LOCATION}/timeline/segment/annotation/create`,
                    params
                )
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.addMany([res.data.entry])
                        timelineSegmentStore.addAnnotation([{ timelineSegmentId, entry: res.data.entry }])
                        return res.data.entry.id;
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async toggle({ timelineSegmentId, annotationId }) {
            const params = {
                timeline_segment_id: timelineSegmentId,
                annotation_id: annotationId,
            };


            const annotationCategoryStore = useAnnotationCategoryStore()
            const annotationStore = useAnnotationStore()

            return axios
                .post(
                    `${config.API_LOCATION}/timeline/segment/annotation/toggle`,
                    params
                )
                .then((res) => {
                    if (res.data.status === "ok") {
                        if ("annotation_added" in res.data) {
                            annotationStore.add(res.data.annotation_added);
                        }
                        if ("annotation_category_added" in res.data) {
                            annotationCategoryStore.add(res.data.annotation_category_added);
                        }
                        if ("timeline_segment_annotation_deleted" in res.data) {
                            this.deleteMany(res.data.timeline_segment_annotation_deleted);
                        }
                        if ("timeline_segment_annotation_added" in res.data) {
                            this.addMany(res.data.timeline_segment_annotation_added);
                        }
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async delete(id) {
            const params = {
                timeline_segment_annotation_id: id,
            };

            const timelineSegmentStore = useTimelineSegmentStore()


            return axios
                .post(
                    `${config.API_LOCATION}/timeline/segment/annotation/delete`,
                    params
                )
                .then((res) => {
                    if (res.data.status === "ok") {
                        [res.data.entry].forEach((id, i) => {
                            let index = state.timelineSegmentAnnotationList.findIndex(
                                (f) => f === id
                            );
                            state.timelineSegmentAnnotationList.splice(index, 1);
                            delete state.timelineSegmentAnnotations[id];
                        });
                        timelineSegmentStore.deleteAnnotation([id]);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async fetchForVideo({ videoId }) {
            let params = {};
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
                .get(`${config.API_LOCATION}/timeline/segment/annotation/list`, {
                    params,
                })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceAll(res.data.entries)
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        deleteMany(timelineSegmentAnnotations) {
            timelineSegmentAnnotations.forEach((id, i) => {
                let index = state.timelineSegmentAnnotationList.findIndex(
                    (f) => f === id
                );
                state.timelineSegmentAnnotationList.splice(index, 1);
                delete state.timelineSegmentAnnotations[id];
            });
        },
        addMany(timelineSegmentAnnotations) {
            timelineSegmentAnnotations.forEach((e, i) => {
                this.timelineSegmentAnnotations[e.id] = e;
                this.timelineSegmentAnnotationList.push(e.id);
            });
        },
        replaceAll(timelineSegmentAnnotations) {
            this.timelineSegmentAnnotations = {};
            this.timelineSegmentAnnotationList = [];
            timelineSegmentAnnotations.forEach((e, i) => {
                this.timelineSegmentAnnotations[e.id] = e;
                this.timelineSegmentAnnotationList.push(e.id);
            });
        },
    },
})