<template>
  <v-dialog v-model="dialog" max-width="90%">
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.export.title") }}

        <v-btn icon @click="dialog = false" absolute right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-tabs vertical class="tabs-left">
          <v-tab
            v-for="export_format in export_formats_sorted"
            :key="export_format.name"
          >
            <v-icon left> {{ export_format.icon }} </v-icon>
            <span class="text-button">{{ export_format.name }}</span>
          </v-tab>
          <v-tab-item
            v-for="export_format in export_formats_sorted"
            :key="export_format.name"
          >
            <v-card flat height="100%">
              <v-card-title>{{ export_format.name }} </v-card-title>
              <v-card-text>
                <Parameters :parameters="export_format.parameters">
                </Parameters>
              </v-card-text>

              <v-card-actions class="pt-0">
                <v-btn
                  @click="
                    downloadExport(
                      export_format.export,
                      export_format.parameters
                    )
                  "
                  >{{ $t("modal.export.export") }}</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn @click="dialog = false">{{ $t("modal.export.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import AnnotationForm from "./AnnotationForm.vue";
import Parameters from "./Parameters.vue";
import { mapStores } from "pinia";
import { useVideoStore } from "@/store/video";

export default {
  components: { AnnotationForm },
  props: ["value"],
  data() {
    return {
      dialog: false,
      export_formats: [
        {
          name: this.$t("modal.export.csv.export_name"),
          icon: "mdi-file",
          export: "csv",
          parameters: [
            {
              field: "checkbox",
              name: "merge_timeline",
              value: true,
              text: this.$t("modal.export.csv.timeline_merge"),
            },
            {
              field: "checkbox",
              name: "use_timestamps",
              value: true,
              text: this.$t("modal.export.csv.use_timestamps"),
            },
            {
              field: "checkbox",
              name: "include_category",
              value: true,
              text: this.$t("modal.export.csv.include_category"),
            },
          ],
        },
      ],
    };
  },
  computed: {
    export_formats_sorted() {
      return this.export_formats.sort((a, b) => a.name.localeCompare(b.name));
    },
    ...mapStores(useVideoStore),
  },
  methods: {
    async downloadExport(format, parameters) {
      parameters = parameters.map((e) => {
        if ("file" in e) {
          return { name: e.name, file: e.file };
        } else {
          return { name: e.name, value: e.value };
        }
      });
      this.videoStore
        .export({ format: format, parameters: parameters })
        .then(() => {
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
  components: { Parameters },
};
</script>
