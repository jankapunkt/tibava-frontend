import Vue from "vue";
import router from "../../router";
import axios from "../../plugins/axios";
import config from "../../../app.config";
import { isEqual, lsplit, keyInObj } from "../../plugins/helpers";

const api = {
    namespaced: true,
    state: {
        plugins: {},
        pluginList: [],
    },
    getters: {
        // all: (state) => {
        //     return state.shortcutList.map((id) => state.shortcuts[id]);
        // },
        // get: (state) => (id) => {
        //     return state.shortcuts[id];
        // },
        // getByKeys: (state) => (id) => {
        //     return state.shortcuts[id];
        // },
    },
    actions: {
        async list({ commit }) {

            return axios
                .post(`${config.API_LOCATION}/plugin/list`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        commit("add", [res.data.entry]);
                        return res.data.entry.id;
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async run({ commit }, { plugin, videoId = null }) {
            const params = {
                plugin: plugin,
            };
            if (videoId) {
                params.video_id = videoId;
            } else {
                const video = this.getters["video/current"];
                if (video) {
                    params.video_id = video.id;
                }
            }

            return axios
                .post(`${config.API_LOCATION}/plugin/run`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        commit("add", [res.data.entry]);
                        return res.data.entry.id;
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        // async listUpdate({ commit }, { videoId = null }) {
        //     let params = {};

        //     //use video id or take it from the current video
        //     if (videoId) {
        //         params.video_id = videoId;
        //     } else {
        //         const video = this.getters["video/current"];
        //         if (video) {
        //             params.video_id = video.id;
        //         }
        //     }
        //     console.log(`shortcut::listUpdate ${JSON.stringify(params)}`);
        //     return axios
        //         .get(`${config.API_LOCATION}/shortcut/list`, { params })
        //         .then((res) => {
        //             if (res.data.status === "ok") {
        //                 commit("update", res.data.entries);
        //             }
        //         });
        //     // .catch((error) => {
        //     //     const info = { date: Date(), error, origin: 'collection' };
        //     //     commit('error/update', info, { root: true });
        //     // });
        // },
    },
    mutations: {
        add(state, plugins) {
            plugins.forEach((e, i) => {
                state.plugins[e.id] = e;
                state.pluginList.push(e.id);
            });
        },
        update(state, plugins) {
            state.plugins = {};
            state.pluginList = [];
            plugins.forEach((e, i) => {
                state.plugins[e.id] = e;
                state.pluginList.push(e.id);
            });
        },
    },
};
export default api;
