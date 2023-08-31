import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";

import { defineStore } from "pinia";

export const usePlaceStore = defineStore("place", {
    state: () => {
        return {
            places: {},
            placeList: [],
            isLoading: false,
        };
    },
    getters: {
        getDeletedplaces(state) {
            return (cluster_id) => {
                return state.placeList
                .map((id) => state.places[id])
                .filter((f) => f.cluster_id == cluster_id)
                .filter((f) => f.deleted == true)
                .map((f) => {
                    return f.place_ref;
                });
            }
        },
        getImagePaths(state) {
            return (cluster) => {
                let result = [];
                
                cluster.cluster.object_refs.forEach((place_ref) => {
                    if(!this.places[place_ref].deleted){
                        result.push(this.places[place_ref].image_path);
                    }
                });

                return result;
            }
        },
        getPlaceRef(state) {
            return (image_path) => {
                return state.placeList
                .map((id) => state.places[id])
                .filter((f) => f.image_path == image_path)
                .map((f) => {
                    return f.place_ref;
                })[0];
            }
        },
        getIndexList(state) {
            return (cluster) => {
                let result = [];
                
                cluster.cluster.object_refs.forEach((place_ref, index) => {
                    if(!this.places[place_ref].deleted){
                        result.push(index);
                    }
                });

                return result;
            }
        }
    },
    actions: {
        async fetchAll(video_id){
            if (this.isLoading) {
                return
            }
            this.isLoading = true

            return axios.get(`${config.API_LOCATION}/place/fetch`, { params: { video_id: video_id } })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceStore(res.data.entries);
                    }
                    else{
                        console.log("error in fetchAll places");
                        console.log(res.data);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async setDeleted(place_ref_list, cluster_id){
            if (this.isLoading) {
              return;
            }
            this.isLoading = true;

            let params = {
                place_ref_list: place_ref_list,
                cluster_id: cluster_id
            };

            return axios
                .post(`${config.API_LOCATION}/place/setDeleted`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        place_ref_list.forEach((filteredPlace) => {
                            this.places[filteredPlace].deleted = true;
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
            this.places = {};
            this.placeList = [];
            items.forEach((e, i) => {
                this.places[e.place_ref] = e;
                this.placeList.push(e.place_ref);
            });
            console.log("this.places")
            console.log(this.places)
            console.log("this.placeList")
            console.log(this.placeList)
        },
        clearStore() {
            this.places = {};
            this.placeList = [];
        }
    }
})