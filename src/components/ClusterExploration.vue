<template>
    <div>
        <v-dialog v-model="show" width="90%" persistent>
            <template v-slot:activator="{ on }">
                <v-btn @click="showCanvas" v-on="on" text block large>
                    <v-icon left>{{ "mdi-eye-outline" }}</v-icon>
                    {{ $t("button.edit") }}
                </v-btn>
            </template>
            <v-card v-show="show" class="canvasContainer" ref="canvasContainer" style="height: 90vh;">
                <v-card-title>Cluster {{ this.cluster.id }} </v-card-title>
                <v-card-subtitle>Click on images to mark them for deletion.</v-card-subtitle>
                <v-card-text class="scrollable-content">
                    <!-- Scrollable Content -->
                    <img class="clusterImg" v-for="imageUrl in displayedImages " :key="imageUrl" :src="imageUrl"
                        :style="borderStyle(imageUrl)" @click="mark(imageUrl)" />
                </v-card-text>
                <v-card-actions variant="tonal">
                    <v-btn :disabled="!imagesSelectedForDeletion()" @click="showConfirmation = true"> {{ $t("button.apply")
                    }}
                    </v-btn>
                    <v-btn @click="abortDeletion"> {{ $t("button.cancel") }} </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="showConfirmation" width="auto">
            <v-card>
                <v-card-title>
                    Confirm
                </v-card-title>
                <v-card-text>
                    Delete {{ this.markedForDeletion.length }} images from Cluster {{ this.cluster.id }}?
                    <v-card-text style="color: red" v-if="allImagesMarked()"> <b>You selected all images. This removes the
                            cluster.</b></v-card-text>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="applyDeletion"> Confirm </v-btn>
                    <v-btn @click="showConfirmation = false"> Back </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
  
<script>
import { mapStores } from "pinia";
import { useFaceStore } from "@/store/face";
import { usePlaceStore } from "@/store/place";

export default {
    props: ["cluster", "isFaceCluster"],
    data() {
        return {
            show: false,
            showConfirmation: false,
            displayedImages: [], // Array to store the displayed images
            markedForDeletion: [],
        };
    },
    methods: {
        showCanvas() {
            // Clear the displayedImages array before adding new images
            this.displayedImages = [];

            // Create a copy of the cluster array to avoid directly modifying the prop
            if (this.isFaceCluster) {
                const faceStore = useFaceStore();
                this.displayedImages = faceStore.getImagePaths(this.cluster);
            } else {
                const placeStore = usePlaceStore();
                this.displayedImages = placeStore.getImagePaths(this.cluster);
            }

            // Set show to true to show the v-card
            this.show = true;
        },
        marked(imageUrl) {
            return this.markedForDeletion.includes(imageUrl);
        },
        imagesSelectedForDeletion() {
            return this.markedForDeletion.length > 0;
        },
        allImagesMarked() {

            if (this.isFaceCluster) {
                const faceStore = useFaceStore();
                return this.markedForDeletion.length >= this.cluster.cluster.embedding_ids.length - faceStore.getDeletedFaces(this.cluster.systemId).length;
            } else {
                const placeStore = usePlaceStore();
                return this.markedForDeletion.length >= this.cluster.cluster.embedding_ids.length - placeStore.getDeletedPlaces(this.cluster.systemId).length;
            }
        },
        mark(imageUrl) {
            if (this.marked(imageUrl)) {
                this.markedForDeletion = this.markedForDeletion.filter((e) => e != imageUrl);
            } else {
                this.markedForDeletion.push(imageUrl);
            }
        },
        borderStyle(imageUrl) {
            if (this.marked(imageUrl)) {
                return 'border: 5px solid red'
            }
            return ''
        },
        async applyDeletion() {
            if (this.isFaceCluster) {
                const faceStore = useFaceStore();
                var embedding_ids_to_delete = this.markedForDeletion.map((path) => faceStore.getFaceRef(path));
                await faceStore.setDeleted(embedding_ids_to_delete, this.cluster.systemId);
            } else {
                const placeStore = usePlaceStore();
                var embedding_ids_to_delete = this.markedForDeletion.map((path) => placeStore.getPlaceRef(path));
                await placeStore.setDeleted(embedding_ids_to_delete, this.cluster.systemId);
            }

            this.markedForDeletion = [];
            this.showConfirmation = false;
            this.show = false;
            this.$emit("update");
            if (this.allImagesMarked()) {
                this.$emit("deleteCluster");
            }
        },
        abortDeletion() {
            this.markedForDeletion = [];
            this.show = false;
            this.$emit("update");
        }
    },
    ...mapStores(useFaceStore, usePlaceStore),
};
</script>

<style>
.scrollable-content {
    max-height: 83%;
    overflow-y: auto;
    margin-bottom: 5px;
}

.clusterImg {
    margin: 5px;
    height: 100px;
}

.canvasContainer {
    background: white;
}
</style>