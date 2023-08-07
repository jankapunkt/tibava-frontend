<template>
    <v-dialog v-model="show" max-width="1000">
        <template v-slot:activator="{ on }">
            <v-btn @click="showCanvas" v-on="on" text block large>
                <v-icon left>{{ "mdi-eye-outline" }}</v-icon>
                {{ $t("button.edit") }}
            </v-btn>
        </template>
        <v-card v-show="show" ref="canvasContainer" width="1024" height="768">
            <img v-for="imageUrl in displayedImages" :key="imageUrl" :src="imageUrl" />
        </v-card>
    </v-dialog>
</template>
  
<script>

export default {
    props: ["cluster"],
    data() {
        return {
            show: false,
            displayedImages: [], // Array to store the displayed images
        };
    },
    methods: {
        showCanvas() {
            // Clear the displayedImages array before adding new images
            this.displayedImages = [];

            // Create a copy of the cluster array to avoid directly modifying the prop
            const clusterCopy = this.cluster.image_paths ? this.cluster.image_paths.slice() : [];

            // Add each image URL from the cluster to the displayedImages array
            clusterCopy.forEach((imageUrl) => {
                this.displayedImages.push(imageUrl);
            });

            // Set show to true to show the v-card
            this.show = true;
        },
    },
};
</script>
  