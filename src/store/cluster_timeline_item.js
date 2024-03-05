import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";
import { usePlayerStore } from "./player";
import { usePluginRunStore } from "./plugin_run";

import { defineStore } from "pinia";

export const useClusterTimelineItemStore = defineStore("clusterTimelineItem", {
    state: () => {
        return {
            clusterTimelineItems: {},
            isLoading: false,
        };
    },
    getters: {
        latestPlaceClustering(state) {
            return () => {
                const pluginRunStore = usePluginRunStore();
                const playerStore = usePlayerStore();

                let place_clustering = pluginRunStore
                    .forVideo(playerStore.videoId)
                    .filter((e) => e.type == "place_clustering" && e.status == "DONE")
                    .sort((a, b) => {
                        return new Date(b.date) - new Date(a.date);
                    })
                    ;
                if (!place_clustering.length) {
                    return [];
                }
                return Object.values(state.clusterTimelineItems)
                             .filter((cti) => cti.plugin_run === place_clustering[0].id)
                             .sort((a, b) => b.items.length - a.items.length);
            }
        },
        latestFaceClustering(state) {
            return () => {
                const pluginRunStore = usePluginRunStore();
                const playerStore = usePlayerStore();

                let face_clustering = pluginRunStore
                    .forVideo(playerStore.videoId)
                    .filter((e) => e.type == "face_clustering" && e.status == "DONE")
                    .sort((a, b) => {
                        return new Date(b.date) - new Date(a.date);
                    })
                    ;
                if (!face_clustering.length) {
                    return [];
                }
                return Object.values(state.clusterTimelineItems)
                             .filter((cti) => cti.plugin_run === face_clustering[0].id)
                             .sort((a, b) => b.items.length - a.items.length);
            }
        },
    },
    actions: {
        async fetchAll(videoId) {
            if (videoId == null || videoId == undefined) {
                const playerStore = usePlayerStore();
                videoId = playerStore.videoId;
            }
            if (this.isLoading) {
                return
            }
            this.isLoading = true

            return axios.get(`${config.API_LOCATION}/cluster/timeline/item/fetch`, { params: { video_id: videoId } })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceStore(res.data.entries);
                    }
                    else {
                        console.log("error in fetchAll clusterTimelineItems");
                        console.log(res.data);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async merge({ cluster_from_id, cluster_to_id }) {
            if (this.isLoading) {
                return;
            }
            this.isLoading = true;

            const cluster_from = this.clusterTimelineItems[cluster_from_id];
            const cluster_to = this.clusterTimelineItems[cluster_to_id];

            let params = {
                from_id: cluster_from.id,
                to_id: cluster_to.id
            };

            return axios
                .post(`${config.API_LOCATION}/cluster/timeline/item/merge`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        Vue.set(
                            cluster_to,
                            "items",
                            cluster_to.items.concat(cluster_from.items)
                        );
                        this.deleteFromStore(cluster_from_id);
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


            const updated_ctis = { ...this.clusterTimelineItems };
            updated_ctis[cluster_id].name = name;
            Vue.set(this, "clusterTimelineItems", updated_ctis);

            let params = {
                cti_id: this.clusterTimelineItems[cluster_id].id,
                name: name,
            };

            return axios
                .post(`${config.API_LOCATION}/cluster/timeline/item/rename`, params)
                .then((res) => {
                    if (res.data.status !== "ok") {
                        console.log("Error in CTI Rename");
                        console.log(res.data);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async create({ cluster_id, name, video_id }) {
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
                .post(`${config.API_LOCATION}/cluster/timeline/item/create`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.addToStore(res.data.entry);
                    }
                    else {
                        console.log("Error in clusterTimelineItem/create");
                        console.log(res.data);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });

        },
        async delete(cluster_id) {
            if (this.isLoading) {
                return;
            }
            this.isLoading = true;

            let params = {
                id: this.clusterTimelineItems[cluster_id].id,
            };

            return axios
                .post(`${config.API_LOCATION}/cluster/timeline/item/delete`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.deleteFromStore(cluster_id);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async deleteItems(cluster_id, item_ids) {
            if (this.isLoading) {
                return;
            }
            this.isLoading = true;

            let params = {
                item_ids: item_ids,
                cluster_id: cluster_id
            };

            return axios
                .post(`${config.API_LOCATION}/cluster/item/delete`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        Vue.set(this.clusterTimelineItems[cluster_id], "items", this.clusterTimelineItems[cluster_id].items.filter((i) => !item_ids.includes(i.id)));
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
        deleteFromStore(cluster_id) {
            Vue.delete(this.clusterTimelineItems, cluster_id);
        },
        addToStore(clusterTimelineItem) {
            Vue.set(this.clusterTimelineItems, clusterTimelineItem.cluster_id, clusterTimelineItem);
        },
        replaceStore(items) {
            this.clearStore();
            items.forEach((e) => {this.addToStore(e)});
        },
        clearStore() {
            Object.keys(this.clusterTimelineItems).forEach(key => {
                Vue.delete(this.clusterTimelineItems, key);
            });
        }

    },
});