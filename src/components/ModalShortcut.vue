<template>
  <v-dialog v-model="show" max-width="1000">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block large>
        {{ $t("modal.shortcut.title") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.shortcut.title") }}

        <v-btn icon @click.native="show = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">{{ $t("modal.shortcut.annotation") }}</th>
                <th class="text-left">{{ $t("modal.shortcut.shortcut") }}</th>
                <!-- <th class="text-right"></th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in shortcuts" :key="item.name">
                <td>
                  <v-chip>
                    <v-btn
                      disable
                      icon
                      x-small
                      :color="item.color"
                      class="mr-1"
                    >
                      <v-icon>{{ "mdi-palette" }}</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="item.category"
                      disable
                      x-small
                      :color="item.color"
                      class="mr-1"
                      >{{ item.category.name }}
                    </v-btn>
                    <span>{{ item.name }}</span>
                  </v-chip>
                </td>
                <td>
                  <v-text-field
                    solo
                    flat
                    single-line
                    hide-details
                    @keydown="onKeydown(index, $event)"
                    @click:append-outer="clear(index)"
                    append-outer-icon="mdi-close"
                  >
                    <template v-slot:prepend-inner>
                      <v-chip v-for="key in item.keys" :key="key.index">
                        <span>{{ key }}</span>
                      </v-chip>
                    </template>
                  </v-text-field>
                </td>
                <!-- <td>
                  <v-btn x-small icon>
                    <v-icon>{{ "mdi-pencil" }}</v-icon>
                  </v-btn>
                </td> -->
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn class="mr-4" @click="submit" :disable="isSubmitting">
          {{ $t("modal.shortcut.update") }}
        </v-btn>
        <v-btn @click="show = false">{{ $t("modal.shortcut.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";

export default {
  props: [],
  data() {
    return {
      show: false,
      isSubmitting: false,

      shortcuts: [],
    };
  },
  computed: {
    video() {
      const video = this.$store.getters["video/current"];
      return video;
    },
    annotations() {
      const annotations = this.$store.getters["annotation/all"];
      return annotations;
    },
  },
  methods: {
    onKeydown(index, event) {
      event.preventDefault();
      let newKeys = [];
      if (event.ctrlKey) {
        newKeys.push("Ctrl");
      }
      if (event.shiftKey) {
        newKeys.push("Shift");
      }
      const lowerChar = event.key.toLowerCase();
      if (lowerChar.length === 1) {
        newKeys.push(lowerChar);
      }
      const newShortcut = { ...this.shortcuts[index], ...{ keys: newKeys } };
      Vue.set(this.shortcuts, index, newShortcut);
    },
    clear(index) {
      const newShortcut = { ...this.shortcuts[index], ...{ keys: [] } };
      Vue.set(this.shortcuts, index, newShortcut);
    },
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
    async submit() {
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;
      await this.$store.dispatch("annotationShortcut/update", {
        annotationShortcuts: this.shortcuts,
      });

      this.isSubmitting = false;
      this.$emit("update:show", false);
    },
  },
  watch: {
    show(value) {
      if (value) {
        this.shortcuts = this.annotations;

        this.shortcuts.forEach((e) => {
          e.keys = [];
        });
        this.$emit("close");
      }
    },
  },
};
</script>
