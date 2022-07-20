<template>
  <div>
    <template v-for="parameter in parameters">
      <v-text-field
        v-model="parameter.value"
        :label="parameter.text"
        v-if="parameter.field == 'text_field'"
        :key="parameter.name"
      ></v-text-field>

      <v-select
        v-model="parameter.value"
        :items="shot_timelines"
        :label="parameter.text"
        :hint="parameter.hint"
        item-text="name"
        item-value="id"
        v-if="parameter.field == 'select_timeline' && shot_timelines.length > 0"
        :key="parameter.name"
        persistent-hint
      ></v-select>

      <div v-if="parameter.field == 'slider'" :key="parameter.name">
        <v-slider
          v-model="parameter.value"
          :label="parameter.text"
          :min="parameter.min"
          :max="parameter.max"
          :step="parameter.step"
          :value="parameter.default"
          thumb-label="always"
        ></v-slider>
      </div>

      <div v-if="parameter.field == 'buttongroup'" :key="parameter.name">
        <p>
          {{ parameter.text }}
        </p>
        <v-btn-toggle
          v-model="parameter.value"
          :label="parameter.text"
          tile
          group
          mandatory
        >
          <v-btn v-for="button in parameter.buttons" :key="button">
            {{ button }}
          </v-btn>
        </v-btn-toggle>
      </div>
    </template>
  </div>
</template>


<script>
import { mapStores } from "pinia";
import { useTimelineStore } from "../store/timeline";
export default {
  props: ["parameters"],
  computed: {
    shot_timelines() {
      var timelines = this.timelineStore.all.filter(
        (timeline) => timeline.type == "A"
      );

      function getTimelineDict(timeline) {
        console.log(timeline);
        return { name: timeline.name, id: timeline.id };
      }

      timelines = timelines.map(getTimelineDict);
      return timelines;
    },
    ...mapStores(useTimelineStore),
  },
};
</script>