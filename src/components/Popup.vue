<template>
    <div>
        <button v-on:click="loadConfirmPopup">Click for popup</button>
    </div>
</template>

<script>
//import axios from "axios";


export default {
  name: "PopupView",
  methods: {
      loadConfirmPopup: function () {
          this.$alert("Hello Vue Simple Alert.");
    }
  }

}
</script>


<style>
</style>
