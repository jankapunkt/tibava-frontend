<template>
  <div id="search-general">
    <v-text-field
      v-model="query"
      class="mx-2 sbar"
      label="Search"
      placeholder="Placeholder"
      rounded
      solo
      flat
      outlined
      single-line
      hide-details
    >
      <v-btn :title="$t('button.search')" @click="submit" small icon>
        <v-icon> mdi-magnify </v-icon>
      </v-btn></v-text-field
    >
    <!-- <v-combobox
      v-model="query"
      class="mx-1 sbar"
      ref="combobox"
      @click:clear="remove(-1)"
      @keyup.enter="submit($event)"
      :placeholder="$t('home.search.placeholder')"
      allow-overflow
      rounded
      solo
      hide-details
      flat
      clearable
      multiple
      single-line
      outlined
    >
      <v-btn :title="$t('button.search')" @click="submit" small icon>
        <v-icon> mdi-magnify </v-icon>
      </v-btn>
    </v-combobox> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // lang: this.$store.state.api.lang.toUpperCase(),
      langItems: ["EN"],
      query: "",
    };
  },
  methods: {
    submit() {
      //   this.$store.dispatch("api/load");
    },
    remove(index) {
      if (index === -1) {
        this.query = [];
      } else {
        this.query.splice(index, 1);
      }
    },
  },
  computed: {
    //   updateQuery() {
    //     return this.$store.state.api.query;
    //   },
  },
  watch: {
    // query: {
    //   handler(newValues, oldValues) {
    //     if (!this.isEqual(newValues, oldValues)) {
    //       let query = [];
    //       newValues.every((value) => {
    //         if (typeof value === "string") {
    //           let positive = true;
    //           if (value.charAt(0) === "-") {
    //             value = value.slice(1);
    //             positive = false;
    //           }
    //           query.push({ type: "txt", positive, value });
    //         } else if (typeof value === "object") {
    //           if (value.example) {
    //             query = value.entries;
    //             return false;
    //           }
    //           query.push(value);
    //         }
    //         return true;
    //       });
    //       this.$store.commit("api/updateQuery", query);
    //     }
    //   },
    //   deep: true,
    // },
    // updateQuery: {
    //   handler(values) {
    //     this.query = values;
    //     if (!this.$store.state.api.random && values.length) {
    //       this.submit();
    //     }
    //   },
    //   deep: true,
    // },
  },
  components: {},
};
</script>

<style>
.v-chip .v-avatar {
  padding-top: 3px;
}

.v-input .v-btn {
  letter-spacing: 1;
}

.v-application--is-ltr .v-text-field.v-text-field .v-input__prepend-inner {
  padding-right: 12px;
}

.v-select.v-select--is-menu-active .v-input__icon--append .v-icon {
  transform: rotate(0deg);
}

#search-general {
  display: flex;
  flex: 1 1 auto;
  max-width: 100%;
}

.v-autocomplete:not(.v-input--is-focused).v-select--chips input {
  max-height: 25px !important;
}

header
  .v-autocomplete
  .v-text-field.v-text-field--solo
  .v-input__control
  input {
  max-width: fit-content;
  min-width: 0;
}

.sbar.v-autocomplete .v-select__selections {
  -ms-overflow-style: none;
  scrollbar-width: none;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}

.sbar.v-autocomplete .v-select__selections::-webkit-scrollbar {
  height: 0;
  width: 0;
}

.sbar.v-autocomplete .v-select__selections > .v-chip {
  overflow: initial;
}

.theme--light.v-icon,
.v-dialog .v-expansion-panel-content__wrap .capitalize {
  color: rgba(69, 123, 157, 0.54);
}

.v-input__icon--append .theme--light.v-icon:not(.mdi-menu-down),
.v-input__prepend-inner .theme--light.v-icon {
  color: rgba(0, 0, 0, 0.54);
}

.v-main
  .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state)
  > .v-input__control
  > .v-input__slot
  fieldset {
  border: 3px solid;
  color: #f5f5f5;
}

.v-main .v-text-field--outlined.v-input--has-state fieldset,
.v-main .v-text-field--outlined.v-input--is-focused fieldset {
  border: 3px solid;
}

header
  .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state)
  > .v-input__control
  > .v-input__slot
  fieldset {
  border: 0px solid;
}

header .v-text-field--outlined.v-input--has-state fieldset,
header .v-text-field--outlined.v-input--is-focused fieldset {
  border: 0px solid;
}

header .v-text-field--filled > .v-input__control > .v-input__slot,
header .v-text-field--full-width > .v-input__control > .v-input__slot,
header .v-text-field--outlined > .v-input__control > .v-input__slot {
  min-height: 48px;
}

.v-chip__content .v-btn__content {
  justify-content: center;
}

.v-input.lang {
  font-family: "Roboto Mono", monospace;
  text-transform: uppercase;
  width: min-content;
}

.v-input.lang > .v-input__control > .v-input__slot {
  padding: 0 6px !important;
}

.v-input.lang > .v-input__control .v-select__selections > input {
  display: none;
}

.v-input.lang .v-input__append-inner {
  display: none;
}
</style>
