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
                  >{{ item.entity_name }}</span
                ></template
              >
              <span>{{ item.entity_name }}</span>
            </v-tooltip>
          </v-progress-linear>
        </div>
      </div>
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
