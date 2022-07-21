import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";

import { defineStore } from "pinia";
import { usePlayerStore } from "./player";
import { useAnnotationStore } from "./annotation";
import { useShortcutStore } from "./shortcut";
import { useAnnotationShortcutStore } from "./annotation_shortcut";
import { useAnnotationCategoryStore } from "./annotation_category";
import { useTimelineStore } from "./timeline";
import { useTimelineSegmentStore } from "./timeline_segment";
import { useTimelineSegmentAnnotationStore } from "./timeline_segment_annotation";

import { usePluginRunStore } from "./plugin_run";
import { usePluginRunResultStore } from "./plugin_run_result";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useVideoStore = defineStore("video", {
    // other options...
    state: () => {
        return {
            videos: {},
            videoList: [],
            isLoading: false,
        };
    },
    getters: {
        all(state) {
            return state.videoList.map((id) => state.videos[id]);
        },
        get(state) {
            return (id) => {
                return state.videos[id];
            };
        },
    },
    actions: {
        async fetch({
            videoId,
            includeTimeline = true,
            includeAnnotation = true,
            includeAnalyser = true,
            includeShortcut = true,
        }) {
            this.isLoading = true;
            let promises = [];
            const playerStore = usePlayerStore();
            const annotationCategoryStore = useAnnotationCategoryStore();
            const annotationStore = useAnnotationStore();
            const timelineStore = useTimelineStore();
            const timelineSegmentStore = useTimelineSegmentStore();
            const timelineSegmentAnnotationStore =
                useTimelineSegmentAnnotationStore();
            const pluginRunStore = usePluginRunStore();
            const pluginRunResultStore = usePluginRunResultStore();
            const shortcutStore = useShortcutStore();
            const annotationShortcutStore = useAnnotationShortcutStore();

            promises.push(playerStore.fetchVideo({ videoId }));
            if (includeAnnotation) {
                promises.push(annotationCategoryStore.fetchForVideo({ videoId }));
                promises.push(annotationStore.fetchForVideo({ videoId }));
            }
            if (includeTimeline) {
                promises.push(timelineStore.fetchForVideo({ videoId }));
                promises.push(timelineSegmentStore.fetchForVideo({ videoId }));
                promises.push(
                    timelineSegmentAnnotationStore.fetchForVideo({ videoId })
                );
            }
            if (includeAnalyser) {
                promises.push(
                    pluginRunStore.fetchForVideo({
                        videoId: videoId,
                        addResults: true,
                    })
                );
                promises.push(
                    pluginRunResultStore.fetchForVideo({
                        videoId: videoId,
                        addResults: true,
                    })
                );
            }
            if (includeShortcut) {
                promises.push(shortcutStore.fetchForVideo({ videoId }));
                promises.push(annotationShortcutStore.fetchForVideo({ videoId }));
            }
            return Promise.all(promises).then(() => {
                console.log("Loading done!");
                this.isLoading = false;
            });
        },
        async fetchAll() {
            return axios.get(`${config.API_LOCATION}/video/list`).then((res) => {
                if (res.data.status === "ok") {
                    this.replaceStore(res.data.entries);
                }
            });
        },
        async delete(video_id) {
            const params = {
                id: video_id,
            };
            return axios
                .post(`${config.API_LOCATION}/video/delete`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.deleteFromStore([video_id])
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: "collection" };
            //     commit("error/update", info, { root: true });
            // });
        },
        async exportCSV({ videoId }) {
            let params = {};
            //use video id or take it from the current video

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
                .get(`${config.API_LOCATION}/video/export/csv`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        let blob = new Blob([res.data.file], { type: "text/csv" });
                        let link = document.createElement("a");
                        link.href = window.URL.createObjectURL(blob);
                        link.download = `${params.video_id}.csv`;
                        link.click();
                    }
                });
            // .catch((error) => {
            //   const info = { date: Date(), error, origin: 'collection' };
            //   commit('error/update', info, { root: true });
            // });
        },
        async exportJson({ videoId }) {
            let params = {};
            //use video id or take it from the current video

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
                .get(`${config.API_LOCATION}/video/export/json`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        let blob = new Blob([res.data.file], { type: "text/json" });
                        let link = document.createElement("a");
                        link.href = window.URL.createObjectURL(blob);
                        link.download = `${params.video_id}.json`;
                        link.click();
                    }
                });
            // .catch((error) => {
            //   const info = { date: Date(), error, origin: 'collection' };
            //   commit('error/update', info, { root: true });
            // });
        },
        deleteFromStore(ids) {
            ids.forEach((id, i) => {
                let index = this.videoList.findIndex((f) => f === id);
                this.videoList.splice(index, 1);
                delete this.videos[id];
            });
        },
        addToStore(video) {
            this.videos[video.id] = video;
            this.videoList.push(video.id);
        },
        replaceStore(videos) {
            this.videos = {};
            this.videoList = [];
            videos.forEach((e, i) => {
                this.videos[e.id] = e;
                this.videoList.push(e.id);
            });
        },
    },
});
