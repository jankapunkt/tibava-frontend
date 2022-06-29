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
                const video = playerStore.video();
                if (video) {
                    params.video_id = video.id;
                }
            }

            console.log(`ANNOTATION_CREATE ${JSON.stringify(params)}`);
            return axios
                .post(`${config.API_LOCATION}/annotation/create`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.add([res.data.entry]);
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
                    console.log(res.data);
                    if (res.data.status === "ok") {
                        this.update([
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
        async loadForVideo({ videoId = null }) {
            let params = {};

            //use video id or take it from the current video
            if (videoId) {
                params.video_id = videoId;
            } else {

                const playerStore = usePlayerStore();
                const video = playerStore.video();
                if (video) {
                    params.video_id = video.id;
                }
            }

            console.log(`Annotation::listUpdate ${JSON.stringify(params)}`);
            return axios
                .get(`${config.API_LOCATION}/annotation/list`, { params })
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
        update(annotations) {
            const newAnnotations = { ...this.annotations };
            annotations.forEach((e, i) => {
                Vue.set(newAnnotations, e.id, e);
            });
            this.annotations = newAnnotations;
        },
        add(annotations) {
            annotations.forEach((e, i) => {
                this.annotations[e.id] = e;
                this.annotationList.push(e.id);
            });
        },
        replaceAll(annotations) {
            this.annotations = {};
            this.annotationList = [];
            annotations.forEach((e, i) => {
                this.annotations[e.id] = e;
                this.annotationList.push(e.id);
            });
        },
    },
})