import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'

export const useAnnotationCategoryStore = defineStore('annotationCategory', {
    state: () => {
        return {
            annotationCategories: {},
            annotationCategoryList: [],
        }
    },
    getters: {
        all: (state) => {
            return state.annotationCategoryList.map(id => state.annotationCategories[id])
        },
        get: (state) => (id) => {
            return state.annotationCategories[id]
        }
    },
    actions: {
        async create({ name, color, videoId = null }) {
            const params = {
                name: name,
                color: color
            }
            if (videoId) {
                params.video_id = videoId;
            }
            else {
                const playerStore = usePlayerStore();
                const video = playerStore.video();
                if (video) {
                    params.video_id = video.id;
                }
            }

            // console.log(`ANNOTATION_CATEGORY_CREATE ${JSON.stringify(params)}`);
            return axios.post(`${config.API_LOCATION}/annotation/category/create`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        this.addToStore([res.data.entry]);
                        return res.data.entry.id;
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async fetchForVideo({ videoId = null }) {
            let params = {}

            //use video id or take it from the current video
            if (videoId) {
                params.video_id = videoId;
            }
            else {

                const video = this.getters["video/current"];
                if (video) {
                    params.video_id = video.id
                }
            }
            // console.log(`AnnotationCategory::listUpdate ${JSON.stringify(params)}`)
            return axios.get(`${config.API_LOCATION}/annotation/category/list`, { params })
                .then((res) => {
                    if (res.data.status === 'ok') {
                        this.replaceStore(res.data.entries);
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },

        addToStore(annotationCategories) {
            annotationCategories.forEach((e, i) => {
                this.annotationCategories[e.id] = e
                this.annotationCategoryList.push(e.id)
            });
        },

        replaceStore(annotationCategories) {
            this.annotationCategories = {}
            this.annotationCategoryList = []
            annotationCategories.forEach((e, i) => {
                this.annotationCategories[e.id] = e
                this.annotationCategoryList.push(e.id)
            });
        }
    },
})