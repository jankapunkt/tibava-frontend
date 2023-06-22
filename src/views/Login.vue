<template>
  <v-app>
    <v-main>
      <v-container class="py-8 px-6" fluid>
        <v-col justify="space-around">
          <v-card class="welcome">
            <v-card-title>
              {{ $t("welcome.title") }}
            </v-card-title>

            <v-card-text>
              <p v-html="$t('welcome.text')"></p>

              <div class="text-h5">{{ $t("welcome.demo_title") }}</div>

              <p>
                <video controls>
                  <source
                    width="10%"
                    src="https://tib.eu/cloud/s/sMmqWqWYict3Zpb/download/TIB-AV-A_Einfuehrung_2.mp4"
                    type="video/mp4"
                  />
                </video>
              </p>

              <div class="text-h5">{{ $t("welcome.login_title") }}</div>

              <p v-html="$t('welcome.login_text')"></p>

              <div class="text-h5">{{ $t("welcome.format_title") }}</div>
              <p v-html="$t('welcome.format_text')"></p>
            </v-card-text>
          </v-card>
        </v-col>
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

      showModalRegister: false,
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
.welcome video {
  margin-left: auto;
  margin-right: auto;
  max-width: 1920px;
  width: 100%;
  height: auto;
  display: block;
}
.welcome {
  margin-bottom: 10px;
}
.video-gallery > * {
  margin: 10px;
}
.welcome .text-h5 {
  margin-bottom: 8px;
  margin-top: 5px;
  font-size: 1.2rem !important;
}
</style>
