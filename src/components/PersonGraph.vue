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
            <div id="graphContainer"></div>
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
import { useFaceStore } from "@/store/face";
import { usePlaceStore } from "@/store/place";

export default {
    data() {
        return {
            show: false,
        };
    },
    mounted() {
        this.isGraphInitialized = true;
    },
    methods: {
        openGraph() {

            if (!this.isGraphInitialized) {
                return;
            }
            this.show = true;
            this.$nextTick(() => {
                const container = document.getElementById("graphContainer");
                console.log(container);
                console.log(this);

                // Define your GraphML data here
                const nodes = new DataSet([
                    { id: 1, label: "Node 1" },
                    { id: 2, label: "Node 2" },
                    { id: 3, label: "Node 3" },
                ]);
                const edges = new DataSet([
                    { from: 1, to: 2 },
                    { from: 2, to: 3 },
                ]);

                const data = {
                    nodes: nodes,
                    edges: edges,
                };

                const options = {
                    // Customize your visualization options here
                };

                const network = new Network(container, data, options);
            })
        },
        close() {
            this.show = false;
        }
    },
};
</script>


<style>
#graphContainer {
    width: 100%;
    height: 90%;
}
</style>