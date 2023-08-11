<template>
    <div>
        <v-dialog v-model="show" width="90%" persistent>
            <template v-slot:activator="{ on }">
                <v-btn @click="showCanvas" v-on="on" text block large>
                    <v-icon left>{{ "mdi-eye-outline" }}</v-icon>
                    {{ $t("button.edit") }}
                </v-btn>
            </template>
            <v-card v-show="show" class="canvasContainer" ref="canvasContainer">
                <v-card-title>Cluster {{ this.cluster.id }}</v-card-title>
                <v-card-subtitle>Click on images to mark them for deletion.</v-card-subtitle>
                <img class="clusterImg" v-for="imageUrl in displayedImages " :key="imageUrl" :src="imageUrl"
                    :style="borderStyle(imageUrl)" @click="mark(imageUrl)" />
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

export default {
    props: ["cluster"],
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

            const faceStore = useFaceStore();
            this.displayedImages = faceStore.getImagePaths(this.cluster);

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
            const faceStore = useFaceStore();
            return this.markedForDeletion.length >= this.cluster.facecluster.face_refs.length - faceStore.getDeletedFaces(this.cluster.systemId).length;
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
                return 'opacity: 0.5; transition: opacity 1s; border: 1px solid red'
            }
            return ''
        },
        async applyDeletion() {
            const faceStore = useFaceStore();
            let face_refs_to_delete = this.markedForDeletion.map((path) => faceStore.getFaceRef(path));

            await faceStore.setDeleted(face_refs_to_delete, this.cluster.systemId);
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
        }
    },
    ...mapStores(useFaceStore),
};
</script>

<style>
.clusterImg {
    margin: 5px;
    height: 100px;
}

.canvasContainer {
    background: white;
}
</style>