<template>
  <v-row align="center" justify="center" class="px-2 py-2">
    <v-col cols="12">
      <div class="pa-4">
        <!-- <v-chip-group column>
          <v-chip v-for="(item, i) in annotations" :key="i">
            <v-progress-circular
              color="#d99090"
              :value="((time - item.start) / (item.end - item.start)) * 100"
            ></v-progress-circular>
            <strong class="mx-2">{{ item.entity_name }}</strong>
          </v-chip>
        </v-chip-group> -->

        <div v-for="(item, i) in annotations" :key="i" class="my-2">
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
        </div>
      </div>
    </v-col>
  </v-row>
</template>


<script>
import TimeMixin from "../mixins/time";

import { mapStores } from "pinia";
import { usePlayerStore } from "../store/player";
import { useTimelineSegmentAnnotationStore } from "../store/timeline_segment_annotation";
import { useAnnotationCategoryStore } from "../store/annotation_category";
import { useAnnotationStore } from "../store/annotation";
import { useTimelineSegmentStore } from "../store/timeline_segment";



export default {
  mixins: [TimeMixin],
  
  methods: {
  },
  computed:{
    annotations(){
      const time = this.playerStore.currentTime;
      const timeline_segment_annotations = this.timelineSegmentAnnotationStore.forTimeLUT(time)
      return timeline_segment_annotations.map((e) => {
          const timeline_segment = this.timelineSegmentStore.get(e.timeline_segment_id);
          const annotation = this.annotationStore.get(e.annotation_id);
          let category = null
          if("category_id" in annotation){
            category = this.annotationCategoryStore.get(annotation.category_id)
          }
          return { name: annotation.name, color:annotation.color, id:annotation.id, category: category, start:timeline_segment.start, end:timeline_segment.end }
      })
    },
    time(){
      return this.playerStore.currentTime;
    },
    ...mapStores(usePlayerStore, useAnnotationCategoryStore, useAnnotationStore, useTimelineSegmentAnnotationStore, useTimelineSegmentStore),
  }
};
</script>
