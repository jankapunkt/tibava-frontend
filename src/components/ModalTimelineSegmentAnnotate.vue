<template>
  <v-dialog v-model="show" max-width="1000">
    <v-card>
      <v-toolbar color="primary" dark>{{
        $t("timelineSegment.title")
      }}</v-toolbar>
      <v-card-text>
        <v-form @submit="submit">
          <v-combobox
            clearable
            multiple
            v-model="inputs"
            :items="items"
            @change="onChange"
            item-text="name"
          >
            <template v-slot:item="{ attrs, item }">
              <v-chip>
                <v-btn
                  disable
                  icon
                  outlined
                  x-small
                  :color="item.color"
                  class="mr-1"
                >
                  <v-icon>{{ "mdi-palette" }}</v-icon>
                </v-btn>
                <v-btn
                  v-if="item.category"
                  disable
                  outlined
                  x-small
                  :color="item.color"
                  class="mr-1"
                  >{{ item.category.name }}
                </v-btn>
                <span>{{ item.name }}</span>
              </v-chip>
            </template>

            <template v-slot:selection="{ attrs, item }">
              <v-chip>
                <v-menu
                  v-model="item.colorMenu"
                  top
                  nudge-bottom="105"
                  nudge-left="16"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      disable
                      icon
                      outlined
                      x-small
                      :color="item.color"
                      class="mr-1"
                      v-on="on"
                    >
                      <v-icon>{{ "mdi-palette" }}</v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-text class="pa-0">
                      <v-color-picker v-model="item.color" flat />
                    </v-card-text>
                  </v-card>
                </v-menu>

                <v-menu
                  v-model="item.categoryMenu"
                  top
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-if="!item.category"
                      disable
                      icon
                      outlined
                      x-small
                      :color="item.color"
                      class="mr-1"
                      v-on="on"
                    >
                      <v-icon>{{ "mdi-menu" }}</v-icon>
                    </v-btn>

                    <v-btn
                      v-else
                      disable
                      outlined
                      x-small
                      :color="item.color"
                      class="mr-1"
                      v-on="on"
                    >
                      {{ item.category.name }}
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-text>
                      <v-combobox
                        clearable
                        v-model="item.category"
                        :items="categories"
                        flat
                        @change="onCategoryChange(item)"
                      >
                        <template v-slot:item="{ attrs, item }">
                          {{ item.name }}
                        </template>
                        <template v-slot:selection="{ attrs, item }">
                          {{ item.name }}
                        </template>
                      </v-combobox>
                    </v-card-text>
                  </v-card>
                </v-menu>
                <span>{{ item.name }}</span>
              </v-chip>
            </template>
          </v-combobox>

          <v-btn class="mr-4" @click="submit">
            {{ $t("timelineSegment.update") }}
          </v-btn>
          <v-btn @click="close">{{ $t("timelineSegment.close") }}</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default {
  props: ["timelineSegment", "annotations", "annotationCategories", "show"],
  data() {
    return {
      items: [
        {
          name: "foo",
          color: "#339911",
          category: { name: "person", color: "#339911" },
          colorMenu: false,
          categoryMenu: false,
        },
        {
          name: "bar",
          color: "#882211",
          category: { name: "emotion", color: "#882211" },
          colorMenu: false,
          categoryMenu: false,
        },
        {
          name: "car",
          color: "#882211",
          category: null,
          colorMenu: false,
          categoryMenu: false,
        },
      ],
      inputs: [],
      categories: [
        { name: "person", color: "#339911", id: "a" },
        { name: "emotion", color: "#882211", id: "b" },
      ],
    };
  },
  computed: {
    disabled() {
      if (this.checkbox) {
        return false;
      }
      return true;
    },
  },
  methods: {
    onChange() {
      let inputs = [];
      this.inputs.forEach((e) => {
        if (typeof e === "string") {
          let splits = e.split(":");
          if (splits.length > 1) {
            let category = splits.shift();
            let name = splits.join(":");
            let color = getRandomColor();
            inputs.push({
              name: name,
              color: color,
              category: { name: category, color: color },
            });
          } else {
            inputs.push({
              name: e,
              color: getRandomColor(),
              category: null,
            });
          }
        } else if (typeof e === "object") {
          inputs.push(e);
        }
      });
      this.inputs = inputs;
    },
    onCategoryChange(item) {
      console.log("foo");
      item.categoryMenu = false;
      if (typeof item.category === "string") {
        item.category = {
          name: item.category,
          color: item.color,
        };
      }
      console.log(item);
    },
    async submit() {
      let categoryLut = {};
      await Promise.all(
        this.inputs.map(async (e) => {
          if (!("id" in e.category)) {
            if (e.category.name in categoryLut) {
              e.category.id = categoryLut[e.category.name].id;
            } else {
              let categoryId = await this.createCategory(e.category);
              e.category.id = categoryId;
              categoryLut[e.category.name] = e.category;
            }
            console.log(categoryLut);
          }
          return e;
        })
      );
      console.log("SUBMIT");
    },
    async createCategory(category) {
      let categoryId = await this.$store.dispatch("annotationCategory/create", {
        name: category.name,
        color: category.color,
      });
      return categoryId;
    },
    close() {
      this.$emit("update:show", false);
    },
  },
  //   watch: {
  //     inputs: {
  //       handler(newValue, oldValue) {
  //         let inputs = [];
  //         newValue.forEach((e) => {
  //           if (typeof e === "string") {
  //             console.log("New annotation");

  //             inputs.push({
  //               name: e,
  //               color: getRandomColor(),
  //             });
  //           } else if (typeof e === "object") {
  //             console.log("Object");
  //             inputs.push(e);
  //           }
  //         });
  //         this.inputs = inputs;
  //       },
  //       deep: true,
  //     },
  //   },
};
</script>
