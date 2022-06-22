<template>
  <v-app>
    <v-main>
      <v-container class="py-8 px-6" fluid>
        <v-row justify="space-around">
          <v-card class="login">
            <v-card-title>
              {{ $t("user.login.title") }}
            </v-card-title>

            <v-card-text>
              <v-text-field
                v-model="user.name"
                :placeholder="$t('user.name')"
                prepend-icon="mdi-account"
                counter="50"
                :rules="[checkLength]"
                clearable
              ></v-text-field>

              <v-text-field
                v-model="user.password"
                :append-icon="
                  showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
                "
                :placeholder="$t('user.password')"
                prepend-icon="mdi-lock"
                @click:append="showPassword = !showPassword"
                :type="showPassword ? 'text' : 'password'"
                counter="50"
                :rules="[checkLength]"
                clearable
              ></v-text-field>
            </v-card-text>

            <v-card-actions class="px-6 pt-2">
              <v-btn
                @click="login"
                :disabled="disabled"
                color="accent"
                block
                rounded
                depressed
              >
                {{ $t("user.login.title") }}
              </v-btn>
            </v-card-actions>

            <div class="grey--text px-6 pb-6" style="text-align: center">
              {{ $t("user.login.text") }}
              <UserRegister @close="dialog = false" />.
            </div>
          </v-card>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import router from "../router";
import UserRegister from "@/components/UserRegister.vue";
import { mapStores } from "pinia";
import { useUserStore } from "@/store/user";

export default {
  data() {
    return {
      user: {
        name: null,
        password: null,
      },

      showPassword: false,
    };
  },
  methods: {
    async login() {
      const loggedIn = await this.userStore.login(this.user);
      if (loggedIn) {
        this.$router.push(this.$route.query.redirect || "/");
      }

      console.log(loggedIn);
    },
    checkLength(value) {
      if (value) {
        if (value.length < 5) {
          return this.$t("user.login.rules.min");
        }

        if (value.length > 50) {
          return this.$t("user.login.rules.max");
        }

        return true;
      }

      return this.$t("field.required");
    },
  },
  computed: {
    disabled() {
      if (Object.keys(this.user).length) {
        const total = Object.values(this.user).reduce(
          (t, value) => t + (this.checkLength(value) === true),
          0
        );

        if (total === 2) return false;
      }

      return true;
    },
    ...mapStores(useUserStore),
  },
  watch: {
    dialog(value) {
      if (value) {
        this.$emit("close");
      }
    },
  },
  components: {
    UserRegister,
  },
};
</script>

<style>
.video-gallery > * {
  margin: 8px;
}
</style>
