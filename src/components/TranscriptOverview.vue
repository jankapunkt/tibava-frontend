<template>
  <v-container>
    <v-virtual-scroll 
      ref="parentContainer" 
      :class="[{'parent-container':true}, 'd-flex', 'flex-column', 'pa-2', 'ma-4']"
      :items="transcripts" 
      height="500" item-height="160" 
    >
      <template v-slot:default="{ item }">
          <TranscriptCard 
            :transcript="item"
            ref="highlightedChild"
            @childHighlighted="scrollToHighlightedChild"
          />
      </template>
    </v-virtual-scroll>
  </v-container>
</template>

<script>
import { mapStores } from "pinia";
import TranscriptCard from "@/components/TranscriptCard.vue";
import { useTimelineSegmentAnnotationStore } from "@/store/timeline_segment_annotation";
export default {
  props: ["transcript"],
  components: {
    TranscriptCard,
  },
  methods: {
    scrollToHighlightedChild(child) {
      console.log("here");
      // if(child.highlighted)
      //   this.$refs.parentContainer.scrollTop = child.offsetTop;
    }
    },
  computed: {
    transcripts() {
      return this.timelineSegmentAnnotationStore.transcriptSegments;
    },
    ...mapStores(useTimelineSegmentAnnotationStore),
  }
};
</script>


<style scoped>
/* Customize the vertical space between items */
.v-list-item {
  margin-top: 8px; /* Adjust the value as per your requirement */
}
</style>