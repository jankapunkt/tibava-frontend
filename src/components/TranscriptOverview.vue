<template>
  <v-card>
  <v-checkbox label="Show as Wordclouds " v-model="showAsWordcloud" height="1"></v-checkbox>
  <v-virtual-scroll
    ref="parentContainer"
    :class="['d-flex', 'flex-column', 'pa-2']"
    :items="transcripts"
    item-height="140"
  >
    <!-- <template v-if="!showAsWordcloud" v-slot:default="{ item }">
      <TranscriptCard 
        :transcript="item"
        :ref="`childContainer-${item.id}`"
        @childHighlighted="scrollToHighlightedChild"
      />
    </template> -->
    <template v-if="showAsWordcloud" v-slot:default="{ item }">
      <WordcloudCard 
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
import WordcloudCard from "@/components/WordcloudCard.vue";
import { useTimelineSegmentAnnotationStore } from "@/store/timeline_segment_annotation";
export default {
  data () {
    return {
      showAsWordcloud: true,
    }
  },
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
    WordcloudCard,
  },
};
</script>