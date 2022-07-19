<template>
  <div>
    <template v-for="parameter in parameters">
      <v-text-field
        v-model="parameter.value"
        :label="parameter.text"
        v-if="parameter.field == 'text_field'"
        :key="parameter.name"
      ></v-text-field>

      <div v-if="parameter.field == 'slider'" :key="parameter.name">
        <v-slider
          v-model="parameter.value"
          :label="parameter.text"
          :min="parameter.min"
          :max="parameter.max"
          :step="parameter.step"
          :value="parameter.default"
          thumb-label="always"
        ></v-slider>
      </div>

      <div v-if="parameter.field == 'buttongroup'" :key="parameter.name">
        <p>
          {{ parameter.text }}
        </p>
        <v-btn-toggle
          v-model="parameter.value"
          :label="parameter.text"
          tile
          group
          mandatory
        >
          <v-btn v-for="button in parameter.buttons" :key="button">
            {{ button }}
          </v-btn>
        </v-btn-toggle>
      </div>
    </template>
  </div>
</template>


<script>
export default {
  props: ["parameters"],
};
</script>