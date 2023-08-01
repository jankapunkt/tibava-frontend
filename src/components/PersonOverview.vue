<template>
  <v-virtual-scroll
    :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
    :items="clusters"
    item-height="140"
    :bench="clustersLength"
    height="100%"
  >
    <template v-slot:default="{ item }">
      <PersonCard
        :cluster="item"
      />
    </template>
  </v-virtual-scroll>
</template>

<script>
import { mapStores } from "pinia";
import PersonCard from "@/components/PersonCard.vue";
import { usePeopleStore } from "@/store/people";

export default {
  computed: {
    clustersLength() {
      return this.clusters.length;
    },
    clusters() {
      return this.peopleStore.clusters;
    },
    ...mapStores(usePeopleStore),
  },
  components: {
    PersonCard,
  },
};
</script>