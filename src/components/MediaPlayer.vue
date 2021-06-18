<template>
    <div>
        <h2 class="text-color pd-player-tittle">Crash Course Engineering Preview English</h2>
        <div id="media_player_div"><video ref="media_player" v-on:timeupdate="onPlayTimeChange" class="no-outline" id="media_player"  width="670" height="450"  src=".././assets/Crash_Course_Engineering_Preview_-_English.mp4" controls></video></div>
    </div>
</template>

<script>
//import axios from "axios";

export default {
  name: "MediPlayerView",
  methods: {
      onPlayTimeChange: function (event){
        this.$root.$refs.ShotBoundaryView.onPlayTimeChange(event);
        //console.log("the time is anchor2: ");
        //console.log(event.target.currentTime);
        //console.log(e.target.currentTime);
        //this.$refs["media_player"].currentTime=30;
      }
  }
}
</script>


<style>
</style>
