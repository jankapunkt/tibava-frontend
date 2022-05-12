<template>
  <v-row align="center" justify="center" class="px-2 py-0">
    <v-col cols="8">
      <v-item-group>
        <v-row>
          <v-col v-for="(item, i) in annotations" :key="i" cols="3">
            <div style="padding-top:30px">
              <v-progress-linear :color="item.color" :rounded="true" :height="15" :value="((time - item.start) / (item.end - item.start)) * 100">
                {{((time - item.start) / (item.end - item.start)) * 100}}
              </v-progress-linear>
              <v-chip :color="item.color">{{ item.entity_name }}</v-chip>
            </div>
          </v-col>
        </v-row>
      </v-item-group>
    </v-col>
  </v-row>
</template>


<script>
import TimeMixin from "../mixins/time";

export default {
  mixins: [TimeMixin],
  props: ["annotations", "time"],
  methods: {
    setVideoPlayerTime(time) {
      this.$emit("seek", time);
    },
  },
};
</script>
