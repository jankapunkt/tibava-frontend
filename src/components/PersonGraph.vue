<template>
    <v-dialog v-model="show" width="90%" persistent>
        <template v-slot:activator="{ on }">
            <v-btn @click="openGraph" style="color: rgb(175, 20, 20); background-color: #E6E6E6; margin-top: 10px;">
                &nbsp; Show as Graph&nbsp;
                <v-icon color="primary">mdi-arrow-top-right-bold-box-outline</v-icon>
            </v-btn>
        </template>
        <v-card style="height: 90vh;">
            <v-card-title>Graph Visualization</v-card-title>
            <v-card-subtitle>You can drag around graph elements.</v-card-subtitle>
            <div v-if="!loading" id="graphContainer"></div>
            <div v-else class="loading-container">
                <div class="spinner">
                    <i class="mdi mdi-loading mdi-spin"></i>
                </div>
                <div class="loading-text">Loading...</div>
            </div>
            <v-card-actions variant="tonal">
                <v-btn @click="close">{{ $t("button.close") }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import "vis";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { mapStores } from "pinia";
import { useFaceclusterStore } from "@/store/facecluster";
import { useClusterTimelineItemStore } from "../store/cluster_timeline_item";

export default {
    props: ["clusters"],
    data() {
        return {
            show: false,
            clusterList: [],
            nodes: null,
            edges: null,
            loading: false,
        };
    },
    created() {
        this.fetchClusters();
        this.prepareData();
    },
    mounted() {
        this.isGraphInitialized = true;
    },
    methods: {
        prepareData() {
            if (this.clusterList.length == 0) {
                return;
            }

            this.loading = true;

            const clusterTimelineItemStore = useClusterTimelineItemStore();

            let dataset = [];
            this.clusterList.forEach((cluster) => {
                dataset.push({ id: cluster.id, label: clusterTimelineItemStore.getName(cluster.systemId) })
            });

            this.nodes = new DataSet(dataset);

            let connections = [];
            let checked = [];
            this.clusterList.forEach((cluster) => {
                this.clusterList.forEach((conn_cluster) => {
                    if (cluster.id === conn_cluster.id) {
                        return;
                    }
                    if (checked.includes(String(cluster.id) + String(conn_cluster.id))) {
                        return;
                    }
                    let value = 0;
                    cluster.timestamps.forEach((timestamp) => {
                        if (conn_cluster.timestamps.includes(timestamp)) {
                            value++;
                        }
                    });
                    if (value > 0) {
                        connections.push({ from: cluster.id, to: conn_cluster.id, value: value, label: String(value) });
                    }
                    checked.push(String(cluster.id) + String(conn_cluster.id));
                    checked.push(String(conn_cluster.id) + String(cluster.id));
                });
            });
            this.edges = new DataSet(connections);
            this.loading = false;

        },
        openGraph() {

            if (!this.isGraphInitialized) {
                return;
            }
            this.loading = true;
            this.show = true;
            this.$nextTick(() => {
                const container = document.getElementById("graphContainer");

                // Define your GraphML data here


                const data = {
                    nodes: this.nodes,
                    edges: this.edges,
                };

                const options = {
                    autoResize: true,
                    nodes: {

                        color: {
                            background: '#ffffff',
                            border: '#ae1313',
                            highlight: '#ae1313',
                        },
                        shape: 'circle',
                        size: 55,
                        font: {
                            size: 16,
                        },
                        borderWidth: 2,
                        shadow: true
                    },
                    edges: {
                        smooth: {
                            forceDirection: "none"
                        }
                    },
                    physics: {
                        forceAtlas2Based: {
                            springLength: 180,
                            springConstant: 0.27
                        },
                    },
                    interaction: {
                        hover: true
                    }
                };

                var network = new Network(container, data, options);
            })
            this.loading = false;
        },
        fetchClusters() {
            let tempList = this.faceclusterStore.clusters;

            if (tempList.length == 0) {
                return
            }

            this.clusterList = tempList.filter((item) => this.clusterTimelineItemStore.getID(item.systemId) !== -1);
        },
        close() {
            this.show = false;
        },
    },
    computed: {
        availableClusters() {
            const clusterTimelineItemStore = useClusterTimelineItemStore();
            return clusterTimelineItemStore.all.length;
        },
        ...mapStores(useFaceclusterStore, useClusterTimelineItemStore)
    },
    watch: {
        availableClusters(num) {
            this.fetchClusters();
            this.prepareData();
        },
    }
};
</script>


<style>
#graphContainer {
    width: 100%;
    height: 90%;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

.spinner {
    font-size: 48px;
    color: #3498db;
    /* Change the color as desired */
}

.loading-text {
    margin-top: 10px;
    font-size: 18px;
}
</style>