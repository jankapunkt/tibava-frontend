import axios from '../plugins/axios';
import config from '../../app.config';

import { defineStore } from 'pinia'
import { useVideoStore } from './video'
// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const usePlayerStore = defineStore('player', {
    // other options...
    state: () => {
        return {
            video: null,
            currentTime: 0.0,
            targetTime: 0.0,
        }
    },
    getters: {
        videoDuration(state) {
            if (state.video && "duration" in state.video) {
                return state.video.duration;
            }
            return 0.0
        },
        videoName(state) {
            if (state.video && "name" in state.video) {
                return state.video.name;
            }
            return ""
        },
        videoId(state) {
            if (state.video && "id" in state.video) {
                return state.video.id;
            }
            return null
        },
        videoUrl(state) {
            if (state.video && "url" in state.video) {
                return state.video.url;
            }
            return null
        },
    },
    actions: {

        async loadVideo({ videoId }) {
            const params = {
                id: videoId,
            };
            return axios
                .get(`${config.API_LOCATION}/video/get`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        // const playerStore = usePlayerStore();
                        this.video = res.data.entry;
                    }
                });
            // .catch((error) => {
            //   const info = { date: Date(), error, origin: 'collection' };
            //   commit('error/update', info, { root: true });
            // });
        },
        // setDuration()

    }
})