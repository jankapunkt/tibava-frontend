<template>
  <v-container>
    <v-virtual-scroll :items="shots" height="500" item-height="160">
      <template v-slot:default="{ item }">
        <v-list-item :key="item.id">
          <TranscriptCard :shot="item" />
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </v-container>
</template>

<script>
import TranscriptCard from "@/components/TranscriptCard.vue";
export default {
  props: ["transcript"],
  components: {
    TranscriptCard,
  },
};
</script>