<template>
  <div>
    <v-menu min-width="175" offset-y bottom left>
      <!-- open-on-hover close-delay -->
      <template v-slot:activator="{ attrs, on }">
        <v-btn icon v-bind="attrs" v-on="on" class="ml-n2">
          <v-icon color="primary">mdi-menu</v-icon>
        </v-btn>
      </template>

      <v-list class="pa-0">
        <v-list-item v-if="videoId" @click="showModalExport = true">
          <v-list-item-title>{{ $t("modal.export.title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="videoId" @click="showModalPlugin = true">
          <v-list-item-title>{{ $t("modal.plugin.title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="videoId" @click="showModalShortcut = true">
          <v-list-item-title>{{ $t("modal.shortcut.title") }}</v-list-item-title>
        </v-list-item>

      </v-list>
    </v-menu>

    <ModalExport :show.sync="showModalExport">
    </ModalExport>

    <ModalPlugin :show.sync="showModalPlugin">
    </ModalPlugin>

    <ModalShortcut :show.sync="showModalShortcut">
    </ModalShortcut>

  </div>
</template>

<script>
import ModalExport from "@/components/ModalExport.vue";
import ModalPlugin from "@/components/ModalPlugin.vue";
import ModalShortcut from "@/components/ModalShortcut.vue";

import { mapStores } from "pinia";
import { useUserStore } from "@/store/user";
import { usePlayerStore } from "@/store/player";

export default {
  data() {
    return {
      showModalExport: false,
      showModalPlugin: false,
      showModalShortcut: false,
    };
  },
  computed: {
    videoId() {
      const videoId = this.playerStore.videoId;
      return videoId;
    },
    loggedIn() {
      return this.userStore.loggedIn;
    },

    ...mapStores(useUserStore, usePlayerStore),
  },
  components: {
    ModalExport,
    ModalPlugin,
    ModalShortcut,
  },
};
</script>

<style>
.v-menu__content .v-btn:not(.accent) {
  text-transform: capitalize;
  justify-content: left;
}

.v-btn:not(.v-btn--round).v-size--large {
  height: 48px;
}
</style>
