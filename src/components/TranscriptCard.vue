<template>
  <v-card class="d-flex flex-column pa-2 ma-4" elevation="4" v-on:click="setVideoPlayerTime(transcript.start)">
    <span style="color:rgb(0, 0, 0); margin-bottom:0.2cm">{{ get_timecode(transcript.start) }}</span>
    <span>{{transcript.name}}</span>
  </v-card>
</template>

<script>
import TimeMixin from "../mixins/time";

import { mapStores } from "pinia";
import { usePlayerStore } from "@/store/player";
import { useAnnotationStore } from "../store/annotation";
import { useAnnotationCategoryStore } from "../store/annotation_category";
import { useTimelineSegmentAnnotationStore } from "../store/timeline_segment_annotation";
import { useTimelineSegmentStore } from "../store/timeline_segment";

export default {
  mixins: [TimeMixin],
  props: ["transcript"],
  methods: {
    setVideoPlayerTime(time) {
      this.playerStore.setTargetTime(time);
    },
  },
  computed: {
    annotations(){
      const cur_time = this.playerStore.currentTime;
      const timeline_segment_annotations = this.timelineSegmentAnnotationStore.forTimeLUT(cur_time)
      return timeline_segment_annotations.map((e) => {
        const timeline_segment = this.timelineSegmentStore.get(e.timeline_segment_id);
        const annotation = this.annotationStore.get(e.annotation_id);
        let cat = null;
        if("category_id" in annotation){
          cat = this.annotationCategoryStore.get(annotation.category_id)
        }
        else
        {
          cat = "Unknown"
        }
        return { name: annotation.name, color:annotation.color, id:annotation.id, category: cat, start:timeline_segment.start, end:timeline_segment.end }
     })
    },
    time(){
      return this.playerStore.currentTime;
    },
    ...mapStores(usePlayerStore, useAnnotationCategoryStore, useTimelineSegmentStore, useAnnotationStore, useTimelineSegmentAnnotationStore),
  }
};
</script>