import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";

import { defineStore } from "pinia";

export const useFaceStore = defineStore("face", {
    state: () => {
        return {
            faces: {},
            faceList: [],
            isLoading: false,
        };
    },
    getters: {
        getDeletedFaces(state) {
            return (cluster_id) => {
                return state.faceList
                .map((id) => state.faces[id])
                .filter((f) => f.cluster_id == cluster_id)
                .filter((f) => f.deleted == true)
                .map((f) => {
                    return f.face_ref;
                });
            }
        },
        getRemainingFaceRefs(state) {
            return (cluster_id) => {
                // Create a copy of the cluster array to avoid directly modifying the prop
                return state.faceList
                .map((id) => state.faces[id])
                .filter((f) => f.cluster_id == cluster_id)
                .filter((f) => deleted !== true)
                .map((f) => {
                    return f.face_ref;
                });
            }
        }
    },
    actions: {
        async fetchAll(video_id){
            if (this.isLoading) {
                return
            }
            this.isLoading = true

            return axios.get(`${config.API_LOCATION}/face/fetch`, { params: { video_id: video_id } })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceStore(res.data.entries);
                    }
                    else{
                        console.log("error in fetchAll faces");
                        console.log(res.data);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async setDeleted(face_ref_list, cluster_id){
            if (this.isLoading) {
              return;
            }
            this.isLoading = true;

            let params = {
                face_ref_list: face_ref_list,
                cluster_id: cluster_id
            };

            return axios
                .post(`${config.API_LOCATION}/face/setDeleted`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        const filteredFaces = this.faceList
                        .map((id) => this.faces[id])
                        .filter((f) => face_ref_list.includes(f.face_ref));

                        filteredFaces.forEach((filteredFace) => {
                            this.faces[filteredFace.id].deleted = true;
                        });
                    }
                    else{
                        console.log("Error in clusterTimelineItem/setTimeline");
                        console.log(res.data);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        replaceStore(items) {
            this.faces = {};
            this.faceList = [];
            items.forEach((e, i) => {
                this.faces[e.id] = e;
                this.faceList.push(e.id);
            });
        },
        clearStore() {
            this.faces = {};
            this.faceList = [];
        }
    }
})