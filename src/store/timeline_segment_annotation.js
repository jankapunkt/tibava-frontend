import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'


import { useAnnotationCategoryStore } from "@/store/annotation_category";
import { useAnnotationStore } from "@/store/annotation";
import { useTimelineStore } from "@/store/timeline";
import { useTimelineSegmentStore } from "@/store/timeline_segment";


export const useTimelineSegmentAnnotationStore = defineStore('timelineSegmentAnnotation', {
    state: () => {
        return {
            timelineSegmentAnnotations: {},
            timelineSegmentAnnotationByTime: {},
            timelineSegmentAnnotationList: [],

            timelineSegmentAnnotationListAdded: [],
            timelineSegmentAnnotationListDeleted: [],
            isLoading: false,
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
        forTimeLUT: (state) => (time) => {
            const timeSecond = Math.round(time)
            if (timeSecond in state.timelineSegmentAnnotationByTime) {
                const timelineSegmentIds = state.timelineSegmentAnnotationByTime[timeSecond];
                return timelineSegmentIds.map((id) => {
                    return state.timelineSegmentAnnotations[id]
                }
                );
            }
            return []
        }
    },
    actions: {
        async create({ timelineSegmentId, annotationId }) {
            if (this.isLoading) {
                return
            }
            this.isLoading = true

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
                        this.addToStore([res.data.entry])
                        timelineSegmentStore.addAnnotation([{ timelineSegmentId, entry: res.data.entry }])
                        return res.data.entry.id;
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async delete(id) {
            if (this.isLoading) {
                return
            }
            this.isLoading = true

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
                })
                .finally(() => {
                    this.isLoading = false;
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async fetchForVideo({ videoId }) {
            if (this.isLoading) {
                return
            }
            this.isLoading = true

            let params = {};
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
                .get(`${config.API_LOCATION}/timeline/segment/annotation/list`, {
                    params,
                })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.updateStore(res.data.entries)
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        clearStore() {
            this.timelineSegmentAnnotationByTime = {}
            this.timelineSegmentAnnotationListAdded = []
            this.timelineSegmentAnnotationListDeleted = []
            this.timelineSegmentAnnotations = {}
            this.timelineSegmentAnnotationList = []
        },
        deleteFromStore(timelineSegmentAnnotations) {
            timelineSegmentAnnotations.forEach((id, i) => {
                this.timelineSegmentAnnotationListDeleted.push(id)
                let index = this.timelineSegmentAnnotationList.findIndex(
                    (f) => f === id
                );
                this.timelineSegmentAnnotationList.splice(index, 1);
                delete this.timelineSegmentAnnotations[id];
            });
            this.updateTimeStore()
        },
        addToStore(timelineSegmentAnnotations) {
            timelineSegmentAnnotations.forEach((e, i) => {

                this.timelineSegmentAnnotationListAdded.push(e.id)
                this.timelineSegmentAnnotations[e.id] = e;
                this.timelineSegmentAnnotationList.push(e.id);
            });
            this.updateTimeStore()
        },
        updateStore(timelineSegmentAnnotations) {
            timelineSegmentAnnotations.forEach((e, i) => {
                if (e.id in this.timelineSegmentAnnotations) {
                    return
                }
                this.timelineSegmentAnnotationListAdded.push(e.id)
                this.timelineSegmentAnnotations[e.id] = e;
                this.timelineSegmentAnnotationList.push(e.id);
            });
            this.updateTimeStore()
        },
        updateTimeStore() {
            const timelineSegmentStore = useTimelineSegmentStore()
            timelineSegmentStore.all.forEach((e) => {
                for (var i = Math.floor(e.start); i < Math.ceil(e.end); i++) {
                    if (i in this.timelineSegmentAnnotationByTime) {
                        this.forTimelineSegment(e.id).forEach((timelineSegmentAnnotation) => {
                            this.timelineSegmentAnnotationByTime[i].push(timelineSegmentAnnotation.id)
                        })
                    }
                    else {
                        this.timelineSegmentAnnotationByTime[i] =
                            this.forTimelineSegment(e.id).map((timelineSegmentAnnotation) => timelineSegmentAnnotation.id)
                    }
                }
            })
        }
    },
})