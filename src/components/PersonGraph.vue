<template>
    <v-dialog v-model="show" width="90%" persistent>
        <template v-slot:activator="{ on }">
            <v-btn @click="openGraph" style="color: rgb(175, 20, 20);">&nbsp; Show as Graph&nbsp;
                <v-icon color="primary">mdi-arrow-top-right-bold-box-outline</v-icon>
            </v-btn>
        </template>
        <v-card style="height: 90vh;">
            <v-card-title>Graph Visualization</v-card-title>
            <v-card-subtitle>You can drag around graph elements.</v-card-subtitle>

            <div v-if="loading" class="loading-container">
                <div class="spinner">
                    <i class="mdi mdi-loading mdi-spin"></i>
                </div>
                <div class="loading-text">Loading...</div>
            </div>
            <div id="graphContainer">
            </div>
            <div v-if="!loading" align="center" class="text-caption">
                <v-text-field
                    v-model="desired_min_size"
                    type="number"
                    style="width: 80px"
                    density="compact"
                    hide-details
                    variant="outlined"
                ></v-text-field>
                <h3>Minimum Cluster Size</h3>
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
            loading: true,
            cluster_min_size: 0,
            cluster_max_size: null,
            desired_min_size: 0,
            network: null,
            data: null,
            options: null,
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
            const clusterTimelineItemStore = useClusterTimelineItemStore();

            this.clusterList.forEach((cluster) => {
                if (cluster.timestamps.length < this.cluster_min_size) {
                    this.cluster_min_size = cluster.timestamps.length;
                }
                if (cluster.timestamps.length > this.cluster_max_size) {
                    this.cluster_max_size = cluster.timestamps.length;
                }
            });

            let dataset = [];
            this.clusterList.forEach((cluster) => {
                if (cluster.timestamps.length < this.desired_min_size) {
                    return;
                }
                dataset.push({ id: cluster.id, label: clusterTimelineItemStore.getName(cluster.systemId) + "\nSize:" + cluster.timestamps.length })
            });

            this.nodes = new DataSet(dataset);

            let connections = [];
            let checked = [];
            this.clusterList.forEach((cluster) => {
                if (cluster.timestamps.length < this.desired_min_size) {
                    return;
                }

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

        },
        openGraph() {

            if (!this.isGraphInitialized) {
                return;
            }

            this.prepareData();
            // Destroy the existing network (if it exists)
            if (this.network) {
                this.network.destroy();
            }

            this.show = true;
            this.loading = true;

            this.$nextTick(() => {

                // Define your GraphML data here

                this.data = {
                    nodes: this.nodes,
                    edges: this.edges,
                };

                this.options = {
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
                            springLength: 250,
                            springConstant: 0.27
                        },
                    },
                };

                const container = document.getElementById("graphContainer");
                this.network = new Network(container, this.data, this.options);

                const functionThatDoesWhatYouNeed = () => {
                    this.loading = false;
                }
                this.network.on('afterDrawing', functionThatDoesWhatYouNeed);
            })
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
        },
        desired_min_size(value) {
            console.log("dersired_min_size " + this.desired_min_size);
            this.openGraph();
        }
    }
};
</script>


<style>
#graphContainer {
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 72%;
    max-height: 75vh;
    margin-bottom: 5px;
}

.clusterslider {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 0px;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 75vh;
    max-height: 75vh;
    overflow-y: auto;
    margin-bottom: 5px;
}

.spinner {
    font-size: 48px;
    color: #ac1414;
}

.loading-text {
    margin-top: 10px;
    font-size: 18px;
}
</style>