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
            timelineSegmentByTime: {},

            timelineSegmentListAdded: [],
            timelineSegmentListDeleted: [],
        }
    },
    getters: {
        all(state) {
            return state.timelineSegmentList.map((id) => state.timelineSegments[id]);
        },
        forTimeline(state) {
            return (timeline_id) => {
                return state.timelineSegmentList
                    .map((id) => state.timelineSegments[id])
                    .filter((e) => e.timeline_id === timeline_id);
            }
        },
        forTime(state) {
            return (current_time) => {
                return state.timelineSegmentList
                    .map((id) => state.timelineSegments[id])
                    .filter((e) => e.start <= current_time && e.end >= current_time);
            }
        },
        get(state) {
            return (id) => {
                return state.timelineSegments[id];
            }
        },
        selected(state) {
            return state.timelineSegmentSelectedList.map((id) => state.timelineSegments[id]);

        },
        forTimeLUT(state) {
            return (time) => {
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
        getPreviousOnTimeline(state) {
            return (id) => {
                const startTime = state.timelineSegments[id].start
                const timelineId = state.timelineSegments[id].timeline_id
                const segments = this.forTimeline(timelineId).filter((e) => e.end <= startTime).sort((a, b) => a.end - b.end)
                if (segments.length <= 0) {
                    return null
                }
                return segments[segments.length - 1];
            }
        },
        getNextOnTimeline(state) {
            return (id) => {
                const endTime = state.timelineSegments[id].end
                const timelineId = state.timelineSegments[id].timeline_id
                const segments = this.forTimeline(timelineId).filter((e) => e.start >= endTime).sort((a, b) => a.end - b.end)
                if (segments.length <= 0) {
                    return null
                }
                return segments[0];
            }
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
                        const timelineSegmentAnnotationStore = useTimelineSegmentAnnotationStore();

                        timelineSegmentAnnotationStore.deleteFromStore(res.data.timeline_segment_annotation_deleted
                        );
                        timelineSegmentAnnotationStore.addToStore(res.data.timeline_segment_annotation_added
                        );
                        this.deleteFromStore(res.data.timeline_segment_deleted);
                        this.addToStore(res.data.timeline_segment_added);
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
                        const timelineSegmentAnnotationStore = useTimelineSegmentAnnotationStore();

                        timelineSegmentAnnotationStore.deleteFromStore(res.data.timeline_segment_annotation_deleted
                        );
                        timelineSegmentAnnotationStore.addToStore(res.data.timeline_segment_annotation_added
                        );
                        this.deleteFromStore(res.data.timeline_segment_deleted);
                        this.addToStore(res.data.timeline_segment_added);
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
                        this.updateStore(res.data.entries);
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
        addToStore(timelineSegments) {
            timelineSegments.forEach((e, i) => {
                this.timelineSegments[e.id] = e;
                this.timelineSegmentList.push(e.id);
            });
            timelineSegments = timelineSegments.sort((a, b) => {
                return a.start - b.start;
            });
            this.updateTimeStore()
        },
        deleteFromStore(ids) {
            ids.forEach((id, i) => {
                let index = this.timelineSegmentList.findIndex((f) => f === id);
                this.timelineSegmentList.splice(index, 1);
                delete this.timelineSegments[id];
            });
            this.updateTimeStore()
        },
        updateStore(timelineSegments) {
            timelineSegments = timelineSegments.sort((a, b) => {
                return a.start - b.start;
            });
            timelineSegments.forEach((e, i) => {
                if (e.id in this.timelineSegments) {
                    return
                }
                this.timelineSegments[e.id] = e;
                this.timelineSegmentList.push(e.id);
            });
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