<template>
  <v-dialog v-model="show" max-width="1000">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block large>
        {{ $t("modal.export.title") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.export.title") }}

        <v-btn icon @click.native="show = false" absolute top right>
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
        <v-btn @click="show = false">{{ $t("timelineSegment.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import AnnotationForm from "./AnnotationForm.vue";
export default {
  components: { AnnotationForm },
  props: [],
  data() {
    return {
      show: true,
    };
  },
  computed: {},
  methods: {
    async downloadCSV() {
      this.$store.dispatch("video/exportCSV", {}).then(() => {
        this.show = false;
      });
    },
    async downloadJson() {
      await this.$store.dispatch("video/exportJson", {}).then(() => {
        this.show = false;
      });
    },
  },
  watch: {
    show(value) {
      if (value) {
        this.$emit("close");
      }
    },
  },
};
</script>
