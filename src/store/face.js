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
                        return f.plugin_item_ref;
                    });
            }
        },
        getImagePaths(state) {
            return (cluster) => {
                let result = [];
                console.log("###################");
                console.log(JSON.stringify(cluster, null, 2));
                console.log(JSON.stringify(this.faces, null, 2));
                cluster.sample_faces_refs.forEach((face_ref) => {
                    if (!this.faces[face_ref].deleted) {
                        result.push(this.faces[face_ref].image_path);
                    }
                });

                return result;
            }
        },
        getFaceRef(state) {
            return (image_path) => {
                return state.faceList
                    .map((id) => state.faces[id])
                    .filter((f) => f.image_path == image_path)
                    .map((f) => {
                        return f.plugin_item_ref;
                    })[0];
            }
        },
        getIndexList(state) {
            return (cluster) => {
                let result = [];

                cluster.faces_refs.forEach((face_ref, index) => {
                    if (!this.faces[face_ref].deleted) {
                        result.push(index);
                    }
                });

                return result;
            }
        }
    },
    actions: {
        async fetchAll(video_id) {
            if (this.isLoading) {
                return
            }
            this.isLoading = true

            return axios.get(`${config.API_LOCATION}/cluster/item/fetch`, { params: { video_id: video_id } })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceStore(res.data.entries.filter((element) => element.type == "FACE"));
                    }
                    else {
                        console.log("error in fetchAll faces");
                        console.log(res.data);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async setDeleted(plugin_item_ref_list, cluster_id) {
            if (this.isLoading) {
                return;
            }
            this.isLoading = true;

            let params = {
                plugin_item_ref_list: plugin_item_ref_list,
                cluster_id: cluster_id
            };

            return axios
                .post(`${config.API_LOCATION}/cluster/item/setDeleted`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        plugin_item_ref_list.forEach((filteredFace) => {
                            this.faces[filteredFace].deleted = true;
                        });
                    }
                    else {
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
                this.faces[e.plugin_item_ref] = e;
                this.faceList.push(e.plugin_item_ref);
            });
        },
        clearStore() {
            this.faces = {};
            this.faceList = [];
        }
    }
})