<template>
    <v-dialog v-model="show" width="90%" persistent>
        <template v-slot:activator="{ on }">
            <v-btn @click="showCanvas" v-on="on" text block large>
                <v-icon left>{{ "mdi-eye-outline" }}</v-icon>
                {{ $t("button.edit") }}
            </v-btn>
        </template>
        <v-card v-show="show" class="canvasContainer" ref="canvasContainer">
            <v-card-title>Person {{ this.cluster.id }}</v-card-title>
            <v-card-subtitle>Click on images to mark them for deletion.</v-card-subtitle>
            <img class="clusterImg" v-for="imageUrl in  displayedImages " :key="imageUrl" :src="imageUrl"
                :style="borderStyle(imageUrl)" @click="mark(imageUrl)" />
            <v-card-actions variant="tonal">
                <v-btn @click="applyDeletion"> {{ $t("button.apply") }} </v-btn>
                <v-btn @click="abortDeletion"> {{ $t("button.cancel") }} </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
  
<script>
import { mapStores } from "pinia";
import { useFaceStore } from "@/store/face";
import { del } from "@vue/composition-api";


export default {
    props: ["cluster"],
    data() {
        return {
            show: false,
            displayedImages: [], // Array to store the displayed images
            markedForDeletion: [],
            faceRefDict: [],
        };
    },
    methods: {
        showCanvas() {
            // Clear the displayedImages array before adding new images
            this.displayedImages = [];

            // Create a copy of the cluster array to avoid directly modifying the prop
            const clusterCopy = this.cluster.image_paths ? this.cluster.image_paths.slice() : [];

            const faceStore = useFaceStore();
            const deletedFaces = faceStore.getDeletedFaces(this.cluster.systemId);
            console.log(deletedFaces);

            // Add each image URL from the cluster to the displayedImages array
            clusterCopy.forEach((imageUrl, index) => {
                if (!deletedFaces.includes(this.cluster.face_refs[index])) {
                    this.displayedImages.push(imageUrl);
                    this.faceRefDict[imageUrl] = this.cluster.face_refs[index];
                }
            });

            // Set show to true to show the v-card
            this.show = true;
        },
        marked(imageUrl) {
            return this.markedForDeletion.includes(imageUrl);
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
            let face_refs_to_delete = this.markedForDeletion.map((el) => this.faceRefDict[el]);
            await faceStore.setDeleted(face_refs_to_delete);
            this.markedForDeletion = [];
            this.show = false;
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