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

      <v-select
        v-model="parameter.value"
        :items="scalar_timelines"
        :label="parameter.text"
        :hint="parameter.hint"
        item-text="name"
        item-value="id"
        v-if="parameter.field == 'select_scalar_timelines' && scalar_timelines.length > 0"
        :key="parameter.name"
        multiple
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
          :disabled="parameter.disabled"
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
import { usePluginRunResultStore } from "../store/plugin_run_result";

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
    scalar_timelines() {
      var timelines = this.timelineStore.all
        .filter(
          (timeline) => timeline.type === "R"
        )
        .map((timeline) => {
          const result = this.pluginRunResultStore.get(timeline.plugin_run_result_id);
          if (result === undefined) {
            return null;
          } else {
            if (result.type !== "S") {
              return null
            }
            timeline.plugin = { data: result.data, type: result.type };
          }
          return timeline;
        })        
        .filter(
          (timeline) => timeline !== null
        )
        .map((timeline)=>{

          return { name: timeline.name, id: timeline.id };
        });

      return timelines
    },
    ...mapStores(useTimelineStore,usePluginRunResultStore),
  },
};
</script>