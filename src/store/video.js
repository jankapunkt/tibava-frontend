import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';

import { defineStore } from 'pinia'
import { usePlayerStore } from './player'

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

        }
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

            promises.push(playerStore.load({ videoId }));
            if (includeAnnotation) {
                promises.push(
                    this.dispatch("annotationCategory/listUpdate", { videoId })
                );
                promises.push(this.dispatch("annotation/listUpdate", { videoId }));
            }
            if (includeTimeline) {
                promises.push(this.dispatch("timeline/listUpdate", { videoId }));
                promises.push(this.dispatch("timelineSegment/listUpdate", { videoId }));
                promises.push(
                    this.dispatch("timelineSegmentAnnotation/listUpdate", { videoId })
                );
            }
            if (includeAnalyser) {
                promises.push(
                    this.dispatch("pluginRun/listUpdate", {
                        videoId: videoId,
                        addResults: true,
                    })
                );
                promises.push(
                    this.dispatch("pluginRunResult/list", {
                        videoId: videoId,
                        addResults: true,
                    })
                )
            }
            if (includeShortcut) {
                promises.push(this.dispatch("shortcut/listUpdate", { videoId }));
                promises.push(
                    this.dispatch("annotationShortcut/listUpdate", { videoId })
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