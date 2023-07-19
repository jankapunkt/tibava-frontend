<template>
  <v-virtual-scroll
    ref="parentContainer"
    :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
    :items="clusters"
    item-height="140"
    :bench="clustersLength"
    height="100%"
  >
    <template v-slot:default="{ item }">
      <PersonCard
        :cluster="item"
        :ref="`childContainer-${item.id}`"
        @childHighlighted="scrollToHighlightedChild"
      />
    </template>
  </v-virtual-scroll>
</template>

<script>
import { mapStores } from "pinia";
import PersonCard from "@/components/PersonCard.vue";
import { usePeopleStore } from "@/store/people";
export default {
  methods: {
    scrollToHighlightedChild(childID) {
      const parentContainer = this.$refs.parentContainer;
      const childContainer = this.$refs[`childContainer-${childID}`];

      if (parentContainer && childContainer) {
        childContainer.$el.scrollIntoView({ behavior: 'auto', block: 'center'});
      }
    },
  },
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