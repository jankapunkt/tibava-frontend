<template>
  <v-virtual-scroll
    :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
    ref="parentContainer"
    :items="clusterList"
    item-height="140"
    :bench="clustersLength"
    height="100%"
  >
    <template v-slot:default="{ item }">
      <PersonCard
        :cluster="item"
        :key="item.systemId"
        :ref="`childContainer-${item.systemId}`"
        @childDeleted="removeChild"
      />
    </template>
  </v-virtual-scroll>
</template>

<script>
import { mapStores } from "pinia";
import PersonCard from "@/components/PersonCard.vue";
import { usePeopleStore } from "@/store/people";
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
      this.clusterList = this.peopleStore.clusters;
      const clusterTimelineItemStore = useClusterTimelineItemStore();
      this.clusterList = this.clusterList.filter((item) => this.clusterTimelineItemStore.getID(item.systemId) !== -1);
    }
  },
  computed: {
    clustersLength() {
      return this.clusterList.length;
    },
    ...mapStores(usePeopleStore, useClusterTimelineItemStore, usePlayerStore),
  },
  components: {
    PersonCard,
  },
};
</script>