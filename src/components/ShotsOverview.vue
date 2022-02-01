<template>
  <div>
    <v-card class="shots d-flex flex-column">
      <v-virtual-scroll
        :bench="benched"
        :items="shots"
        height="400"
        item-height="140"
      >
        <template v-slot:default="{ item }">
          <v-list-item :key="item.id">
            <ShotCard :shot="item" />
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </v-card>
  </div>
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
  max-width: 768px;
  padding: 10px;
  margin: 10px;
}
</style>