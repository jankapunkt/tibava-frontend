<template>
    <div>
        <h2 class="text-color pd-player-tittle text-align-left">{{vidName}}</h2>
        <div id="media_player_div" class="player-align"><video ref="media_player" v-on:timeupdate="onPlayTimeChange" class="no-outline player-padding" id="media_player"  width="565" height="330"  :src="vidFileSrc" controls></video></div>
    </div>
</template>

<script>
//import axios from "axios";

export default {
  name: "MediaPlayerView",
  data() {  
        return {
            vidFileTitle:"",
            vidFileSrc: "f9_scene1.mp4",
            vidName : "Fast & Furious 9 Trailer",
            publicPath: process.env.BASE_URL
        }
  },
  created: function() {
        this.$root.$refs.MediaPlayerView = this;
    },
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
.player-align{
  vertical-align: top;
}
.player-padding{
  padding-bottom: 10px;
}
</style>
