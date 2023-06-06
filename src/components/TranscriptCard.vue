<template>
  <v-card class="d-flex flex-column pa-2 ma-4" elevation="4" v-on:click="setVideoPlayerTime(transcript.start)">
    <v-card-title class="px-2 py-1">Chunk {{ transcript.id }}</v-card-title>
    <v-row justify="center" class="px-2 py-0">
      <v-col cols="8">
        <v-list-item three-line>
          <v-list-item-content min-width>
            <!-- <div class="text-overline mb-4">Shot {{ shot.id }}</div> -->
            <v-list-item-subtitle>Begin: {{ get_timecode(transcript.start) }}</v-list-item-subtitle>
            <v-list-item-subtitle>End: {{ get_timecode(transcript.end) }}</v-list-item-subtitle>
            <!-- <v-list-item-subtitle>Duration:{{ get_timecode(transcript.end - transcript.start) }}</v-list-item-subtitle> -->
          </v-list-item-content>
        </v-list-item>
      </v-col>
      <span>{{transcript.name}}</span>

      <!-- <div v-for="(item, i) in annotations" :key="i" class="my-2">
          <v-progress-linear
            :color="item.color"
            color="#d99090"
            height="30"
            rounded
            :value="((time - item.start) / (item.end - item.start)) * 100"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <span
                  v-bind="attrs"
                  v-on="on"
                  class="mx-2"
                  style="
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                  "
                  >{{ item.name }}</span
                ></template
              >
              <span>{{ item.name }}</span>
            </v-tooltip>
          </v-progress-linear>
        </div> -->
    </v-row>
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