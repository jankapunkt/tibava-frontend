<template>
  <v-dialog
    v-model="dialog"
    max-width="1000"
    persistent
    @keydown.esc="$emit('update:show', false)"
  >
    <!-- <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block large>
        {{ $t("modal.export.title") }}
      </v-btn>
    </template> -->
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.export.title") }}

        <v-btn icon @click="dialog = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row lign="center" justify="center">
          <v-btn @click="downloadCSV" height="100px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-file </v-icon>
              </p>
              {{ $t("modal.export.csv") }}
            </div>
          </v-btn>
          <v-btn @click="downloadJson" height="100px" class="mx-2">
            <div class="mx-auto text-center">
              <p>
                <v-icon x-large> mdi-file </v-icon>
              </p>
              {{ $t("modal.export.json") }}
            </div>
          </v-btn>
        </v-row>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn @click="dialog = false">
          {{ $t("timelineSegment.close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import AnnotationForm from "./AnnotationForm.vue";
import { mapStores } from "pinia";
import { useVideoStore } from "@/store/video";

export default {
  components: { AnnotationForm },
  props: ["value"],
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    ...mapStores(useVideoStore),
  },
  methods: {
    async downloadCSV() {
      this.videoStore.exportCSV().then(() => {
        this.dialog = false;
      });
    },
    async downloadJson() {
      await this.videoStore.exportJson().then(() => {
        this.dialog = false;
      });
    },
  },
  watch: {
    dialog(value) {
      this.$emit("input", value);
    },
    value(value) {
      if (value) {
        this.dialog = true;
      }
    },
  },
};
</script>
