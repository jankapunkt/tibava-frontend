<template>
   <v-card v-if="transcripts.length == 0" elevation="0"> There is no transcript. Create it with the <em>Speech Recognition (whisper)</em> timeline. </v-card>
   <v-virtual-scroll v-else
    ref="parentContainer"
    :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']"
     :items="transcripts"
    item-height="140"
    :bench="transcriptLength"
    height="100%"    
  >
    <template v-slot:default="{ item }">
      <TranscriptCard
        :transcript="item"
        :ref="`childContainer-${item.id}`"
        @childHighlighted="scrollToHighlightedChild"
      />
    </template>
  </v-virtual-scroll>
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
    transcriptLength() {
      return this.transcripts.length;
    },
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