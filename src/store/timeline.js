import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'
import { useTimelineSegmentStore } from '@/store/timeline_segment'
import { usePlayerStore } from '@/store/player'

export const useTimelineStore = defineStore('timeline', {
    state: () => {
        return {
            timelines: {},
            timelineList: [],
            timelineListAdded: [],
            timelineListDeleted: [],
        }
    },
    getters: {
        forVideo(state) {
            return (videoId) => {
                return state.timelineList
                    .map((id) => state.timelines[id])
                    .filter((e) => e.video_id === videoId);
            }
        },
        all(state) {
            return state.timelineList.map((id) => state.timelines[id]);
        },
        added(state) {
            return state.timelineListAdded.map((data) => [data[0], state.timelines[data[1]]]);
        },
        deleted(state) {
            return state.timelineListDeleted;
        },
        get(state) {
            return (id) => {
                return state.timelines[id];
            }
        },
        segmentPosition(state) {
            return (segmentId) => {
                let result = null;
                state.timelineList
                    .map((id) => state.timelines[id])
                    .forEach((timeline, timelinePos) => {
                        if (timeline.segments != null) {
                            timeline.segments.forEach((segment, segmentPos) => {
                                if (segment.id === segmentId) {
                                    result = { timeline: timelinePos, segment: segmentPos };
                                }
                            });
                        }
                    });
                return result;
            }
        },
        getSegmentByPosition(state) {
            return (timelinePos, segmentPos) => {
                let result = null;
                state.timelineList
                    .map((id) => state.timelines[id])
                    .forEach((timeline, iTimelinePos) => {
                        if (timeline.segments != null && timelinePos === iTimelinePos) {
                            timeline.segments.forEach((segment, iSegmentPos) => {
                                if (iSegmentPos === segmentPos) {
                                    result = segment.id;
                                }
                            });
                        }
                    });
                return result;
            }
        },
    },
    actions: {
        async fetchForVideo({ videoId = null }) {
            //use video id or take it from the current video
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
                .get(`${config.API_LOCATION}/timeline/list`, { params })
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

        async duplicate(
            { commit },
            { id, name = null, includeannotations = true }
        ) {
            let params = {
                id: id,
                name: name,
                includeannotations: includeannotations,
            };
            return axios
                .post(`${config.API_LOCATION}/timeline/duplicate`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        commit("add", [res.data.entry]);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'upload' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async create({ name, videoId = null }) {
            let params = {
                name: name,
            };

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
                .post(`${config.API_LOCATION}/timeline/create`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.addToStore(res.data.timeline_added);

                        const timelineSegmentStore = useTimelineSegmentStore();
                        timelineSegmentStore.addToStore(res.data.timeline_segment_added);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'upload' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async importEAF(params) {
            const formData = new FormData();

            //use video id or take it from the current video
            const video = this.getters["video/current"];
            formData.append("file", params.importfile);
            formData.append("video_id", video.id);

            console.log(params);
            console.log(formData);

            return axios.post(
                `${config.API_LOCATION}/timeline/import/eaf`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
        },
        async delete(timeline_id) {
            let params = {
                id: timeline_id,
            };

            // update own store
            this.deleteFromStore([timeline_id])

            // update all segments
            const timelineSegmentStore = useTimelineSegmentStore();
            timelineSegmentStore.deleteTimeline(timeline_id);

            return axios
                .post(`${config.API_LOCATION}/timeline/delete`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        // commit("delete", timeline_id);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },

        async rename({ timelineId, name }) {
            let params = {
                id: timelineId,
                name: name,
            };

            const newTimelines = { ...this.timelines };
            newTimelines[timelineId].name = name;
            Vue.set(this, "timelines", newTimelines);

            return axios
                .post(`${config.API_LOCATION}/timeline/rename`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        // commit("rename", { timelineId, name });
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async changeVisualization({ timelineId, visualization }) {
            let params = {
                id: timelineId,
                visualization: visualization,
            };

            const newTimelines = { ...this.timelines };
            newTimelines[timelineId].visualization = visualization;
            Vue.set(this, "timelines", newTimelines);

            return axios
                .post(`${config.API_LOCATION}/timeline/changevisualization`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        // commit("changevisualization", { timelineId, visualization });
                    }
                });
        },
        async setParent({ timelineId, parentId }) {
            let params = {
                timelineId: timelineId,
                parentId: parentId,
            };

            if (!parentId) {
                params.parentId = null;
            }

            const newTimelines = { ...this.timelines };
            newTimelines[timelineId].parent_id = parentId;
            Vue.set(this, "timelines", newTimelines);

            return axios
                .post(`${config.API_LOCATION}/timeline/setparent`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        // commit("setParent", { timelineId, parentId });
                    }
                });
        },
        async setCollapse({ timelineId, collapse }) {
            let params = {
                timelineId: timelineId,
                collapse: collapse,
            };

            const newTimelines = { ...this.timelines };
            newTimelines[timelineId].collapse = collapse;
            Vue.set(this, "timelines", newTimelines);
            this.updateVisibleStore();

            return axios
                .post(`${config.API_LOCATION}/timeline/setcollapse`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        // commit("setCollapse", { timelineId, collapse });
                    }
                });
        },
        async setOrder({ order }) {
            let params = {
                order: order,
            };

            Vue.set(this, "timelineList", order);

            this.timelineList.forEach((id, i) => {
                this.timelines[id].order = i;
            })

            return axios
                .post(`${config.API_LOCATION}/timeline/setorder`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        // commit("setorder", { order });
                    }
                });
        },
        deleteFromStore(ids) {
            ids.forEach((id, i) => {
                this.timelineListDeleted.push([Date.now(), id])
                let index = this.timelineList.findIndex((f) => f === id);
                this.timelineList.splice(index, 1);
                delete this.timelines[id];
            });
            this.updateVisibleStore()
        },
        addToStore(timelines) {
            timelines.forEach((e, i) => {
                this.timelineListAdded.push([Date.now(), e.id])
                this.timelines[e.id] = e;
                this.timelineList.push(e.id);
            });
            this.updateVisibleStore();
        },
        updateStore(timelines) {
            timelines.forEach((e, i) => {
                if (e.id in this.timelines) {
                    return;
                }
                this.timelineListAdded.push([Date.now(), e.id])
                this.timelines[e.id] = e;
                this.timelineList.push(e.id);
            });
            this.updateVisibleStore();
        },
        updateVisibleStore() {
            const that = this;

            function parentCollapsed(e) {
                if (!e.parent_id) {
                    return false;
                }

                let parent_id = e.parent_id;

                while (parent_id != null) {
                    let parent = that.get(parent_id);
                    parent_id = parent.parent_id;
                    if (parent.collapse) {
                        return true;
                    }
                }

                return false;
            }
            this.timelineList.map((e) => {
                this.timelines[e].visible = !parentCollapsed(this.timelines[e]);
                return e;
            });
        }
    },
})