<template>
  <v-menu v-model="menu" min-width="175" offset-y bottom left open-on-hover>
    <template v-slot:activator="{ attrs, on: menu }">
      <v-btn
        icon
        v-bind="attrs"
        v-on="menu"
        class="ml-n2"
        :title="$t('video.menu.title')"
      >
        <v-icon color="primary">mdi-menu</v-icon>
      </v-btn>
    </template>

    <v-list class="pa-0">
      <v-list-item-group>
        <v-list-item class="px-0">
          <ModalExport @close="menu = false" />
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
import ModalExport from "@/components/ModalExport.vue";

export default {
  data() {
    return {
      menu: false,
    };
  },
  computed: {
    loggedIn() {
      return this.$store.state.user.loggedIn;
    },
  },
  components: {
    ModalExport,
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