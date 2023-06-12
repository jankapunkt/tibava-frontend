<template>
    <v-virtual-scroll 
      ref="parentContainer" 
      :class="[{'parent-container':true}, 'd-flex', 'flex-column', 'pa-2', 'ma-4']"
      :items="transcripts" 
      height="500" item-height="160"  
    >
    <template v-slot:default="{ item }">
        <TranscriptCard 
        :transcript="item"
        @childHighlighted="scrollToHighlightedChild(item.id)" 
        />
      </template>
    </v-virtual-scroll>
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
    scrollToHighlightedChild(childRef) {
      // console.log(this.$children[0].$children)
      const childElement = this.$refs.parentContainer.$refs[0];
      // console.log(childElement);
      if (childElement) {
        console.log("please scroll")
        childElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    },
  computed: {
    transcripts() {
      return this.timelineSegmentAnnotationStore.transcriptSegments;
    },
    ...mapStores(useTimelineSegmentAnnotationStore),
  },
  components: {
    TranscriptCard
  }
};
</script>


<style scoped>
/* Customize the vertical space between items */
.v-list-item {
  margin-top: 8px; /* Adjust the value as per your requirement */
}
</style>