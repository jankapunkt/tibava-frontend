<template>
  <v-card v-if="clustersLength == 0" elevation="0" :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']">
    <span>No face clustering has been conducted yet. Create it with the <em>Face Clustering</em> pipeline.</span>
  </v-card>
  <v-virtual-scroll v-else :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']" ref="parentContainer" :items="clusterList"
    item-height="140" :bench="clustersLength">
    <template v-slot:default="{ item }">
      <PersonCard :cluster="item" :key="item.systemId" :ref="`childContainer-${item.systemId}`"
        @childDeleted="removeChild" />
    </template>
  </v-virtual-scroll>
</template>

<script>
import { mapStores } from "pinia";
import PersonCard from "@/components/PersonCard.vue";
import PersonGraph from "@/components/PersonGraph.vue"
import { useFaceclusterStore } from "@/store/facecluster";
import { useClusterTimelineItemStore } from "@/store/cluster_timeline_item";
import { usePlayerStore } from "@/store/player";
import { usePluginRunResultStore } from "@/store/plugin_run_result";

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
      let tempList = this.faceclusterStore.clusters;

      if (tempList.length == 0) {
        return
      }

      this.clusterList = tempList.filter((item) => this.clusterTimelineItemStore.getID(item.systemId) !== -1);
    }
  },
  computed: {
    pluginRunResults() {
      const pluginRunResultStore = usePluginRunResultStore();
      return pluginRunResultStore.all.length;
    },
    clustersLength() {
      return this.clusterList.length;
    },
    ...mapStores(useFaceclusterStore, useClusterTimelineItemStore, usePlayerStore),
  },
  components: {
    PersonCard,
    PersonGraph,
  },
  watch: {
    pluginRunResults(num) {
      if (num > 0) {
        this.fetchClusters();
      }
    }
  }
};
</script>