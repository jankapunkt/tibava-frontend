<template>
  <v-dialog persistent v-model="show" max-width="1000">
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
            :search-input.sync="search"
            @change="onChange"
            item-text="name"
          >
            <template v-slot:no-data>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    No results matching "<strong>{{ search }}</strong
                    >". Press <kbd>enter</kbd> to create a new one
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>

            <template v-slot:item="{ attrs, item }">
              <v-chip>
                <v-btn disable icon x-small :color="item.color" class="mr-1">
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
            </template>

            <template v-slot:selection="{ attrs, item, index }">
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
                      x-small
                      :color="item.category ? item.category.color : ''"
                      class="mr-2"
                      v-on="on"
                    >
                      <v-icon>{{ "mdi-menu" }}</v-icon>
                    </v-btn>

                    <v-btn
                      v-else
                      disable
                      x-small
                      :color="item.color"
                      class="mr-2"
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
                <v-btn icon class="ml-2" x-small @click="onDeleteItem(index)">
                  <v-icon>{{ "mdi-close" }}</v-icon>
                </v-btn>
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
function onlySpaces(str) {
  return /^\s*$/.test(str);
}

export default {
  props: ["timelineSegment", "annotations", "annotationCategories", "show"],
  data() {
    return {
      search: null,
      inputs: [],
      hiddenAnnotationCategories: [],
      hiddenAnnotations: [],
    };
  },
  computed: {
    categories() {
      let newAnnotationCategories = this.inputs
        .filter((e) => {
          return e.category && !("id" in e.category);
        })
        .map((e) => {
          return e.category;
        });

      let categories = this.hiddenAnnotationCategories.concat(
        newAnnotationCategories
      );
      categories = categories.filter(
        (e, index, self) => self.findIndex((t) => t.name === e.name) === index
      );

      return categories;
    },
    items() {
      return this.hiddenAnnotations;
    },
  },
  methods: {
    onDeleteItem(index) {
      this.inputs.splice(index, 1);
    },
    onChange() {
      let inputs = [];
      let self = this;
      this.inputs.forEach((e) => {
        if (typeof e === "string") {
          //filter empty name and categories
          if (onlySpaces(e)) {
            return;
          }
          let splits = e.split(":");
          if (splits.length > 1) {
            let category = splits.shift();
            let name = splits.join(":");
            //filter empty name and categories
            if (onlySpaces(category)) {
              return;
            }
            if (onlySpaces(name)) {
              return;
            }
            let color = getRandomColor();
            // Filter existing categories and use the color of the category
            let existingCategory = self.categories.filter(
              (e) => e.name === category
            );
            if (existingCategory.length > 0) {
              inputs.push({
                name: name,
                color: existingCategory[0].color,
                category: existingCategory[0],
              });
            } else {
              inputs.push({
                name: name,
                color: color,
                category: { name: category, color: color },
              });
            }
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
      //filter all duplicates
      let existing = {};
      inputs.forEach((e, i) => {
        let name = "";
        if (e.category) {
          name = `${e.category.name}:${e.name}`;
        } else {
          name = `${e.name}`;
        }
        if (!(name in existing)) {
          existing[name] = { element: e, index: i };
        } else {
          // if the existing element has already an id we will skipt that
          if ("id" in existing[name]) {
            return;
          }
          if ("id" in e) {
            existing[name] = { element: e, index: i };
            return;
          }
          if ("category" in existing && "category" in e) {
            if ("id" in existing.category) {
              return;
            }

            if ("id" in e.category) {
              existing[name] = { element: e, index: i };
              return;
            }
          }
        }
      });

      this.inputs = Object.keys(existing).map((e) => {
        return existing[e].element;
      });
    },
    onCategoryChange(item) {
      item.categoryMenu = false;
      if (typeof item.category === "string") {
        // categoryNames;
        item.category = {
          name: item.category,
          color: item.color,
        };
      }
    },
    async submit() {
      let categories = await Promise.all(
        this.categories.map(async (e) => {
          if (!("id" in e)) {
            let categoryId = await this.createCategory(e);
            e.id = categoryId;
          }
          return e;
        })
      );

      let annotations = await Promise.all(
        this.inputs.map(async (e) => {
          if (!("id" in e)) {
            let annotationId = await this.createAnnotation(e);
            e.id = annotationId;
          }
          return e;
        })
      );

      let existingAnnotation = this.timelineSegment.annotations.map(
        (e) => e.annotation.id
      );

      let submittedAnnotation = this.inputs.map((e) => e.id);

      let deletedIds = existingAnnotation.filter(
        (e) => !submittedAnnotation.includes(e)
      );
      let createdIds = submittedAnnotation.filter(
        (e) => !existingAnnotation.includes(e)
      );

      // first create all new connections
      await Promise.all(
        annotations.map(async (e) => {
          if (!createdIds.includes(e.id)) {
            return;
          }
          return await this.createTimelineSegmentAnnotation(e);
        })
      );
      // delete old connections
      await Promise.all(
        this.timelineSegment.annotations.map(async (e) => {
          if (!deletedIds.includes(e.annotation.id)) {
            return;
          }
          return await this.deleteTimelineSegmentAnnotation(e);
        })
      );
      //update existing
      await Promise.all(
        this.timelineSegment.annotations.map(async (e) => {
          await Promise.all(
            this.inputs.map(async (f) => {
              if (e.annotation.id === f.id) {
                if (e.annotation.color !== f.color) {
                  return await this.changeAnnotation(f);
                } else if (("category" in e.annotation) ^ ("category" in f)) {
                  return await this.changeAnnotation(f);
                } else if (
                  (e.annotation.category === null) ^
                  (f.category === null)
                ) {
                  return await this.changeAnnotation(f);
                } else if (e.annotation.category && f.category) {
                  if (e.annotation.category.name !== f.category.name) {
                    return await this.changeAnnotation(f);
                  } else {
                  }
                }
              }
            })
          );
          // if (deletedIds.includes(e.annotation.id)) {
          //   return;
          // }
          // // if
          // return await this.deleteTimelineSegmentAnnotation(e);
        })
      );

      this.$emit("update:show", false);
    },
    async createCategory(category) {
      let categoryId = await this.$store.dispatch("annotationCategory/create", {
        name: category.name,
        color: category.color,
      });
      return categoryId;
    },
    async createAnnotation(annotation) {
      let annotationId = null;
      if (annotation.category) {
        annotationId = await this.$store.dispatch("annotation/create", {
          name: annotation.name,
          color: annotation.color,
          categoryId: annotation.category.id,
        });
      } else {
        annotationId = await this.$store.dispatch("annotation/create", {
          name: annotation.name,
          color: annotation.color,
        });
      }
      return annotationId;
    },
    async createTimelineSegmentAnnotation(annotation) {
      let timelineSegmentAnnotationId = null;
      timelineSegmentAnnotationId = await this.$store.dispatch(
        "timelineSegmentAnnotation/create",
        {
          timelineSegmentId: this.timelineSegment.id,
          annotationId: annotation.id,
        }
      );
      return timelineSegmentAnnotationId;
    },
    async deleteTimelineSegmentAnnotation(timelineSegmentAnnotation) {
      return await this.$store.dispatch(
        "timelineSegmentAnnotation/delete",
        timelineSegmentAnnotation.id
      );
    },
    async changeAnnotation(annotation) {
      if (
        "category" in annotation &&
        annotation.category &&
        "id" in annotation.category
      ) {
        return await this.$store.dispatch("annotation/change", {
          annotationId: annotation.id,
          name: annotation.name,
          color: annotation.color,
          categoryId: annotation.category.id,
        });
      } else {
        return await this.$store.dispatch("annotation/change", {
          annotationId: annotation.id,
          name: annotation.name,
          color: annotation.color,
          categoryId: null,
        });
      }
    },
    close() {
      this.$emit("update:show", false);
    },
  },
  watch: {
    timelineSegment() {
      this.inputs = JSON.parse(
        JSON.stringify(
          this.timelineSegment.annotations.map((e) => e.annotation)
        )
      );
    },
    annotations() {
      this.hiddenAnnotations = JSON.parse(JSON.stringify(this.annotations));
    },
    annotationCategories() {
      this.hiddenAnnotationCategories = JSON.parse(
        JSON.stringify(this.annotationCategories)
      );
    },
  },
};
</script>
