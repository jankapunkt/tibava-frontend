import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'

export const useTimelineStore = defineStore('timeline', {
    state: () => {
        return {
            timelines: {},
            timelineList: [],
        }
    },
    getters: {
        forVideo: (state) => (videoId) => {
            return state.timelineList
                .map((id) => state.timelines[id])
                .filter((e) => e.video_id === videoId);
        },
        all: (state) => {
            return state.timelineList.map((id) => state.timelines[id]);
        },
        get: (state) => (id) => {
            return state.timelines[id];
        },
        segmentPosition: (state) => (segmentId) => {
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
        },
        getSegmentByPosition: (state) => (timelinePos, segmentPos) => {
            console.log(timelinePos);
            console.log(segmentPos);
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
        },
    },
    actions: {
        async listAdd(video_id) {
            let params = {
                id: video_id,
            };
            return axios
                .get(`${config.API_LOCATION}/timeline/list`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        commit("add", res.data.entries);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },

        async listUpdate({ videoId = null }) {
            //use video id or take it from the current video
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
                .get(`${config.API_LOCATION}/timeline/list`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        commit("update", res.data.entries);
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
                const video = playerStore.video();
                if (video) {
                    params.video_id = video.id;
                }
            }
            return axios
                .post(`${config.API_LOCATION}/timeline/create`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.add(res.data.timeline_added);
                        commit("timelineSegment/add", res.data.timeline_segment_added, {
                            root: true,
                        });
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


            let timeline_index = this.timelineList.findIndex(
                (e) => e === timeline_id
            );
            this.timelineList.splice(timeline_index, 1);
            delete this.timelines[timeline_id];
            //TODO we don't need to send changes to the backend
            this.commit("timelineSegment/deleteTimeline", timeline_id, {
                root: true,
            });

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
            newTimelines[args.timelineId].name = args.name;
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
            console.log(timelineId);
            console.log(params);


            const newTimelines = { ...this.timelines };
            newTimelines[args.timelineId].visualization = args.visualization;
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

            console.log(timelineId);
            console.log(params);

            const newTimelines = { ...this.timelines };
            newTimelines[args.timelineId].parent_id = args.parentId;
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
            console.log(timelineId, collapse);

            const newTimelines = { ...this.timelines };
            newTimelines[args.timelineId].collapse = args.collapse;
            Vue.set(this, "timelines", newTimelines);

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
            console.log(order);

            Vue.set(this, "timelineList", args.order);

            return axios
                .post(`${config.API_LOCATION}/timeline/setorder`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        // commit("setorder", { order });
                    }
                });
        },
        add(timelines) {
            timelines.forEach((e, i) => {
                this.timelines[e.id] = e;
                this.timelineList.push(e.id);
            });
        },
        updateAll(timelines) {
            this.timelines = {};
            this.timelineList = [];
            timelines.forEach((e, i) => {
                this.timelines[e.id] = e;
                this.timelineList.push(e.id);
            });
        },
    },
})