<template>
  <v-row align="center" justify="center" class="px-2 py-2">
    <v-col cols="10">
      <v-item-group>
        <v-row v-for="(item, i) in annotations" :key="i">
          <v-col>
            <v-progress-linear
              :color="item.color"
              color="#d99090"
              rounded
              height="70"
              :value="((time - item.start) / (item.end - item.start)) * 100"
            >
              <template v-slot:default="{ name }">
                <strong class="mx-2">{{ item.entity_name }}</strong>
              </template>
            </v-progress-linear>
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
