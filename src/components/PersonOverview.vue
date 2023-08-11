<template>
  <v-card v-if="clustersLength == 0" elevation="0">
    No face clustering has been conducted yet. Create it with the <em>Face Clustering</em> pipeline.
  </v-card>
  <v-virtual-scroll v-else :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']" ref="parentContainer" :items="clusterList"
    item-height="140" :bench="clustersLength" height="100%">
    <template v-slot:default="{ item }">
      <PersonCard :cluster="item" :key="item.systemId" :ref="`childContainer-${item.systemId}`"
        @childDeleted="removeChild" />
    </template>
  </v-virtual-scroll>
</template>

<script>
import { mapStores } from "pinia";
import PersonCard from "@/components/PersonCard.vue";
import { useFaceclusterStore } from "@/store/facecluster";
import { useClusterTimelineItemStore } from "@/store/cluster_timeline_item";
import { usePlayerStore } from "@/store/player";

export default {
  data() {
    return {
      clusterList: []
    }
  },
  created() {
    this.fetchClusters();
  },
  methods: {
    removeChild(childID) {
      this.clusterList = this.clusterList.filter((item) => item.systemId !== childID);
    },
    fetchClusters() {
      this.clusterList = this.faceclusterStore.clusters;

      if (this.clusterList.length == 0) {
        return
      }

      this.clusterList = this.clusterList.filter((item) => this.clusterTimelineItemStore.getID(item.systemId) !== -1);
    }
  },
  computed: {
    clusters() {
      return this.faceclusterStore.clusters;
    },
    clustersLength() {
      return this.faceclusterStore.clusters.length;
    },
    ...mapStores(useFaceclusterStore, useClusterTimelineItemStore, usePlayerStore),
  },
  components: {
    PersonCard,
  },
  watch: {
    clusters() {
      this.fetchClusters();
    }
  }
};
</script>