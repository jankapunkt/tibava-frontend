<template>
  <v-dialog v-model="show" max-width="1000">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block large>
        {{ $t("modal.timeline.create.title") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.timeline.create.title") }}

        <v-btn icon @click.native="show = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-text-field
          :label="$t('modal.timeline.create.name')"
          prepend-icon="mdi-map-marker"
          v-model="name"
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn class="mr-4" @click="submit" :disable="isSubmitting">
          {{ $t("modal.timeline.create.submit") }}
        </v-btn>
        <v-btn @click="show = false">{{
          $t("modal.timeline.create.close")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";

export default {
  props: ["timeline"],
  data() {
    return {
      show: false,
      isSubmitting: false,
      name: null,
      items: [],
    };
  },
  methods: {
    async submit() {
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;

      await this.$store.dispatch("timeline/create", {
        name: this.name,
      });

      this.isSubmitting = false;
      this.show = false;
    },
  },
  watch: {
    show(value) {
      if (value) {
        this.name = null;
        this.$emit("close");
      }
    },
  },
};
</script>
