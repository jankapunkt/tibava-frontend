<template>
    <div>
        <v-dialog v-model="show" width="90%" persistent>
            <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" text block large>
                    <v-icon left>{{ "mdi-eye-outline" }}</v-icon>
                    {{ $t("button.edit") }}
                </v-btn>
            </template>
            <v-card v-show="show" class="canvasContainer" ref="canvasContainer" style="height: 90vh;">
                <v-card-title>Cluster {{ this.cluster.name }} </v-card-title>
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
                    Delete {{ this.markedForDeletion.length }} images from Cluster "{{ this.cluster.name }}"?
                    <v-card-text style="color: red" v-if="allImagesMarked"> <b>You selected all images. This removes the
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
import { useClusterTimelineItemStore } from '../store/cluster_timeline_item';

export default {
    props: ["cluster"],
    data() {
        return {
            show: false,
            showConfirmation: false,
            markedForDeletion: [],
        };
    },
    methods: {
        marked(imageUrl) {
            return this.markedForDeletion.includes(imageUrl);
        },
        imagesSelectedForDeletion() {
            return this.markedForDeletion.length > 0;
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
            const item_ids_to_delete = this.cluster.items.filter((i) => this.markedForDeletion.includes(i.image_path))
                                                         .map((i) => i.id);
            await this.clusterTimelineItemStore.deleteItems(this.cluster.cluster_id, item_ids_to_delete);

            this.markedForDeletion = [];
            this.showConfirmation = false;
            this.show = false;
            this.$emit("update");
            if (this.allImagesMarked) {
                this.$emit("deleteCluster");
            }
        },
        abortDeletion() {
            this.markedForDeletion = [];
            this.show = false;
            this.$emit("update");
        }
    },
    computed: {
        allImagesMarked() {
            return this.markedForDeletion.length === this.displayedImages.length;
        },
        displayedImages() {
            return this.cluster.items.filter((i) => i.is_sample).map((i) => i.image_path);
        },
        ...mapStores(useClusterTimelineItemStore),
    }
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