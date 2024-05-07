<template>
  <v-col style="height: 100%;">
    <v-select solo :items="shotsList" v-model="selectedShots" />
    <v-virtual-scroll ref="parentContainer" :class="['d-flex', 'flex-column', 'pa-2']" :items="shots" item-height="140"
      :bench="shotsLength">
      <template v-slot:default="{ item }">
        <ShotCard :shot="item" :ref="`childContainer-${item.id}`" @childHighlighted="scrollToHighlightedChild" />
      </template>
    </v-virtual-scroll>
  </v-col>
</template>

<script>
import { mapStores } from "pinia";
import ShotCard from "@/components/ShotCard.vue";
import { useShotStore } from "@/store/shot";
export default {
  data() {
    return {
      selectedShotsProxy: null,
    };
  },
  methods: {
    scrollToHighlightedChild(childID) {
      const parentContainer = this.$refs.parentContainer;
      const childContainer = this.$refs[`childContainer-${childID}`];

      if (parentContainer && childContainer) {
        const offset = (parentContainer.$el.offsetHeight - childContainer.$el.offsetHeight) / 2;
        parentContainer.$el.scroll(0, childContainer.$el.parentElement.offsetTop - offset);
      }
    },
  },
  computed: {
    selectedShots: {
      get() {
        const selectedShots = this.shotStore.selectedShots;
        return this.selectedShotsProxy === null ? selectedShots : this.selectedShotsProxy;
      },
      set(val) {
        console.log(val);
        this.selectedShotsProxy = val;

        this.shotStore.setSelectedShots({ shotTimeline: val });
      },
    },
    shotsList() {
      return this.shotStore.shotsList.map((e) => { return { text: e.name, value: e.index } });
    },
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