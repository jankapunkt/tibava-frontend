import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'

export const useAnnotationStore = defineStore('annotation', {
    state: () => {
        return {
            annotations: {},
            annotationList: [],
        }
    },
    getters: {

        all: (state) => {
            return state.annotationList.map((id) => state.annotations[id]);
        },
        get: (state) => (id) => {
            return state.annotations[id];
        },
    },
    actions: {

        async create({ name, color, categoryId, videoId = null }) {
            let params = {
                name: name,
                color: color,
            };
            if (categoryId) {
                params["category_id"] = categoryId;
            }

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
                .post(`${config.API_LOCATION}/annotation/create`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.addToStore([res.data.entry]);
                        return res.data.entry.id;
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async change({ annotationId, name, color, categoryId }) {
            let params = {
                annotation_id: annotationId,
                color: color,
                name: name,
            };
            if (categoryId) {
                params["category_id"] = categoryId;
            }

            return axios
                .post(`${config.API_LOCATION}/annotation/update`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.updateInStore([
                            {
                                id: annotationId,
                                color: color,
                                name: name,
                                category_id: categoryId,
                            },
                        ]);
                        // return res.data.entry.id;
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        // listAdd( segment_hash_id) {
        //     const params = {
        //         hash_id: segment_hash_id,
        //         annotation: annotation
        //     }
        //     axios.post(`${config.API_LOCATION}/annotation_list`, params)
        //         .then((res) => {
        //             if (res.data.status === 'ok') {
        //                 commit('add', params);
        //             }
        //         })
        //         .catch((error) => {
        //             const info = { date: Date(), error, origin: 'collection' };
        //             commit('error/update', info, { root: true });
        //         });
        // },
        async fetchForVideo({ videoId = null }) {
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
                .get(`${config.API_LOCATION}/annotation/list`, { params })
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
        updateInStore(annotations) {
            const newAnnotations = { ...this.annotations };
            annotations.forEach((e, i) => {
                Vue.set(newAnnotations, e.id, e);
            });
            this.annotations = newAnnotations;
        },
        addToStore(annotations) {
            annotations.forEach((e, i) => {
                this.annotations[e.id] = e;
                this.annotationList.push(e.id);
            });
        },
        updateStore(annotations) {
            annotations.forEach((e, i) => {
                if (e.id in this.annotations) {
                    return;
                }
                this.annotations[e.id] = e;
                this.annotationList.push(e.id);
            });
        },
    },
})