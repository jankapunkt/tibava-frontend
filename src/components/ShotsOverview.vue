<template>
  <v-container>
    <v-card class="shots d-flex flex-column">
      <v-virtual-scroll :items="shots" height="500" item-height="160">
        <template v-slot:default="{ item }">
          <v-list-item :key="item.id">
            <ShotCard :shot="item" />
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </v-card>
  </v-container>
</template>

<script>
import ShotCard from "@/components/ShotCard.vue";
export default {
  props: ["shots"],
  methods: {},
  computed: {},
  components: {
    ShotCard,
  },
};
</script>

<style>
.shots {
  max-width: 900px;
  padding: 10px;
  margin: 10px;
}
</style>