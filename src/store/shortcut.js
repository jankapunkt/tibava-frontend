import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'

export const useShortcutStore = defineStore('shortcut', {
    state: () => {
        return {

            shortcuts: {},
            shortcutList: [],
        }
    },
    getters: {

        all: (state) => {
            return state.shortcutList.map((id) => state.shortcuts[id]);
        },
        get: (state) => (id) => {
            return state.shortcuts[id];
        },
        getByKeys: (state) => (id) => {
            return state.shortcuts[id];
        },
    },
    actions: {
        async create({ key, videoId = null }) {
            const params = {
                key: key,
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
                .post(`${config.API_LOCATION}/shortcut/create`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        const shortcut = res.data.entry
                        this.shortcuts[shortcut.id] = shortcut;
                        this.shortcutList.push(shortcut.id);
                        return res.data.entry.id;
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async fetchForVideo({ videoId = null }) {
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
                .get(`${config.API_LOCATION}/shortcut/list`, { params })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceAll(res.data.entries);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        replaceAll(shortcuts) {
            this.shortcuts = {};
            this.shortcutList = [];
            shortcuts.forEach((e, i) => {
                this.shortcuts[e.id] = e;
                this.shortcutList.push(e.id);
            });
        },
    },
})