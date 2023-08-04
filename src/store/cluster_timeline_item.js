import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";

import { defineStore } from "pinia";

export const useClusterTimelineItemStore = defineStore("clusterTimelineItem", {
    state: () => {
        return {
            clusterTimelineItems: {},
            clusterTimelineItemList: [],
            isLoading: false,
        };
    },
    getters: {
        all(state) {
            return state.clusterTimelineItemList.map((id) => state.clusterTimelineItems[id]);
        },
        get(state){
            return (id) => {
                return state.clusterTimelineItems[id];
            };
        },
        hasTimeline(state){
            return (cluster_id) => {
                if (this.clusterTimelineItemList.length === 0){
                    return false;
                }

                if (cluster_id in this.clusterTimelineItems){
                    if (state.clusterTimelineItems[cluster_id].timeline){
                        return true;
                     }
                }

                return false;
            }
        },
        getName(state){
            return (cluster_id) => {
                var name = "Not Found";
                if (cluster_id in this.clusterTimelineItems){
                    name = state.clusterTimelineItems[cluster_id].name;
                }
                return name;
            }
        },
        getTimeline(state){
            return (cluster_id) => {
                if (cluster_id in this.clusterTimelineItems){
                    return state.clusterTimelineItems[cluster_id].timeline;
                }
                return null;
            }
        },
        getID(state){
            return (cluster_id) => {
                if (cluster_id in this.clusterTimelineItems){
                    return state.clusterTimelineItems[cluster_id].id;
                }
                return -1;
            }
        },

    },
    actions: {
        async fetchAll(video_id) {
            if (this.isLoading) {
                return
            }
            this.isLoading = true

            return axios.get(`${config.API_LOCATION}/clusterTimelineItem/fetch`, { params: { video_id: video_id } })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceStore(res.data.entries);
                    }
                    else{
                        console.log("error in fetchAll clusterTimelineItems");
                        console.log(res.data);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async rename({ cluster_id, name }) {
            if (this.isLoading) {
              return;
            }
            this.isLoading = true;
      
            let params = {
              cti_id: this.clusterTimelineItems[cluster_id].id,
              name: name,
            };

            const updated_ctis = { ...this.clusterTimelineItems };
            updated_ctis[cluster_id].name = name;
            Vue.set(this, "clusterTimelineItems", updated_ctis);
      
            return axios
                .post(`${config.API_LOCATION}/clusterTimelineItem/rename`, params)
                .then((res) => {
                if (res.data.status === "ok") {

                }
                else{
                    console.log("Error in CTI Rename");
                    console.log(res.data);
                }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async create({cluster_id, name, video_id}){
            if (this.isLoading) {
              return;
            }
            this.isLoading = true;

            let params = {
                cluster_id: cluster_id,
                name: name,
                video_id: video_id,
            };

            return axios
                .post(`${config.API_LOCATION}/clusterTimelineItem/create`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.addToStore(res.data.entry);
                    }
                    else{
                        console.log("Error in clusterTimelineItem/create");
                        console.log(res.data);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });

        },
        async setTimeline(cluster_id, timeline_id){
            if (this.isLoading) {
              return;
            }
            this.isLoading = true;

            let params = {
                cti_id: this.clusterTimelineItems[cluster_id].id,
                timeline_id: timeline_id,
            };

            return axios
                .post(`${config.API_LOCATION}/clusterTimelineItem/setTimeline`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.clusterTimelineItems[cluster_id].timeline = timeline_id;
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
        async delete(cluster_id){
            if (this.isLoading) {
                return;
            }
            this.isLoading = true;

            let params = {
                id: this.clusterTimelineItems[cluster_id].id,
            };
            // update own store
            this.deleteFromStore(cluster_id);

            return axios
                .post(`${config.API_LOCATION}/clusterTimelineItem/delete`, params)
                .then((res) => {
                if (res.data.status === "ok") {
                    // commit("delete", timeline_id);
                }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        setNewName(cluster_id, newname){
            if (cluster_id in this.clusterTimelineItems){
                this.clusterTimelineItems[cluster_id].name = newname;
                return true;
            }
            return false;
        },
        deleteFromStore(cluster_id) {
            let index = this.clusterTimelineItemList.findIndex((f) => f === cluster_id);
            this.clusterTimelineItemList.splice(index, 1);
            delete this.clusterTimelineItems[cluster_id];
        },
        addToStore(clusterTimelineItem) {
            this.clusterTimelineItems[clusterTimelineItem.cluster_id] = clusterTimelineItem;
            this.clusterTimelineItemList.push(clusterTimelineItem.cluster_id);
        },
        replaceStore(items) {
            this.clusterTimelineItems = {};
            this.clusterTimelineItemList = [];
            items.forEach((e, i) => {
                this.clusterTimelineItems[e.cluster_id] = e;
                this.clusterTimelineItemList.push(e.cluster_id);
            });
        },

    },
});