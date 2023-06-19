<template>
  <v-virtual-scroll
    ref="parentContainer"
    :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
    :items="shots"
    item-height="160"
    :bench="shotsLength"
  >
    <template v-slot:default="{ item }">
      <ShotCard
        :shot="item"
        :ref="`childContainer-${item.id}`"
        @childHighlighted="scrollToHighlightedChild"
      />
    </template>
  </v-virtual-scroll>
</template>

<script>
import { mapStores } from "pinia";
import ShotCard from "@/components/ShotCard.vue";
import { useShotStore } from "@/store/shot";
export default {
  methods: {
    scrollToHighlightedChild(childID) {
      const parentContainer = this.$refs.parentContainer;
      const childContainer = this.$refs[`childContainer-${childID}`];

      if (parentContainer && childContainer) {
        // childContainer.$el.scrollIntoView({ behavior: 'smooth', block: 'center'});
      }
    },
  },
  computed: {
    shotsLength() {
      return this.shots.length;
    },
    shots() {
      return this.shotStore.shots;
    },
    ...mapStores(useShotStore),
  },
  components: {
    ShotCard,
  },
};
</script>