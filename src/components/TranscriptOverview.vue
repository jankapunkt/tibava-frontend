<template>
  <v-card>
  <v-virtual-scroll
    ref="parentContainer"
    :class="['d-flex', 'flex-column', 'pa-2']"
    :items="transcripts"
    item-height="140"
  >
    <template v-slot:default="{ item }">
      <TranscriptCard 
        :transcript="item"
        :ref="`childContainer-${item.id}`"
        @childHighlighted="scrollToHighlightedChild"
      />
    </template>
  </v-virtual-scroll>
  </v-card>
</template>

<script>
import { mapStores } from "pinia";
import TranscriptCard from "@/components/TranscriptCard.vue";
import { useTimelineSegmentAnnotationStore } from "@/store/timeline_segment_annotation";

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
    transcripts() {
      return this.timelineSegmentAnnotationStore.transcriptSegments;
    },
    ...mapStores(useTimelineSegmentAnnotationStore),
  },
  components: {
    TranscriptCard,
  },
};
</script>