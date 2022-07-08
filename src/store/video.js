import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';

import { defineStore } from 'pinia'
import { usePlayerStore } from './player'
import { useAnnotationStore } from './annotation'
import { useShortcutStore } from './shortcut'
import { useAnnotationShortcutStore } from './annotation_shortcut'
import { useAnnotationCategoryStore } from './annotation_category'
import { useTimelineStore } from './timeline'
import { useTimelineSegmentStore } from './timeline_segment'
import { useTimelineSegmentAnnotationStore } from './timeline_segment_annotation'

import { usePluginRunStore } from './plugin_run'
import { usePluginRunResultStore } from './plugin_run_result'



// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useVideoStore = defineStore('video', {
    // other options...
    state: () => {
        return {
            videos: {},
            videoList: [],
        }
    },
    getters: {
        all(state) {
            return state.videoList.map(id => state.videos[id])
        },
        get(state) {
            return (id) => {
                return state.videos[id];
            }
        },
    },
    actions: {
        async loadVideo(
            {
                videoId,
                includeTimeline = true,
                includeAnnotation = true,
                includeAnalyser = true,
                includeShortcut = true,
            }
        ) {
            let promises = [];
            const playerStore = usePlayerStore()
            const annotationCategoryStore = useAnnotationCategoryStore()
            const annotationStore = useAnnotationStore()
            const timelineStore = useTimelineStore()
            const timelineSegmentStore = useTimelineSegmentStore()
            const timelineSegmentAnnotationStore = useTimelineSegmentAnnotationStore()
            const pluginRunStore = usePluginRunStore()
            const pluginRunResultStore = usePluginRunResultStore()
            const shortcutStore = useShortcutStore()
            const annotationShortcutStore = useAnnotationShortcutStore()


            promises.push(playerStore.fetchVideo({ videoId }));
            if (includeAnnotation) {
                promises.push(annotationCategoryStore.fetchForVideo({ videoId }));
                promises.push(annotationStore.fetchForVideo({ videoId }));
            }
            if (includeTimeline) {
                promises.push(timelineStore.fetchForVideo({ videoId }));
                promises.push(timelineSegmentStore.fetchForVideo({ videoId }));
                promises.push(timelineSegmentAnnotationStore.fetchForVideo({ videoId })
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
                )
            }
            if (includeShortcut) {
                promises.push(shortcutStore.fetchForVideo({ videoId }));
                promises.push(
                    annotationShortcutStore.fetchForVideo({ videoId })
                );
            }
            return Promise.all(promises);
        },
        async list() {
            return axios
                .get(`${config.API_LOCATION}/video/list`)
                .then((res) => {
                    if (res.data.status === "ok") {
                        const entries = res.data.entries;
                        this.videos = {}
                        this.videoList = []
                        entries.forEach((e, i) => {
                            this.videos[e.id] = e
                            this.videoList.push(e.id)
                        });
                    }
                })
        },
        add(video) {
            this.videos[video.id] = video;
            this.videoList.push(video.id);
        },
    },
})