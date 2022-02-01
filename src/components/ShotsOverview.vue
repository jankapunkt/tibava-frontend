<template>
  <v-container>
    <v-virtual-scroll :items="shots" height="500" item-height="144">
      <template v-slot:default="{ item }">
        <v-list-item :key="item.id">
          <ShotCard :shot="item" v-on:seek="setVideoPlayerTime" />
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </v-container>
</template>

<script>
import ShotCard from "@/components/ShotCard.vue";
export default {
  props: ["shots"],
  methods: {
    setVideoPlayerTime(time) {
      this.$emit("seek", time);
    },
  },
  computed: {},
  components: {
    ShotCard,
  },
};
</script>