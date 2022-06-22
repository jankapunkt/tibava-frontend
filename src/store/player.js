import { defineStore } from 'pinia'

import { useVideoStore } from './video'
// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const usePlayerStore = defineStore('player', {
    // other options...
    state: () => {
        return {
            video: {},
            currentTime: 0.0,
            targetTime: 0.0,
        }
    },
    action: {

        async load({ videoId }) {
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