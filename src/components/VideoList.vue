<template>
    <div>
        <div class="text-color">
                <div class="annotation">
                   <div class="cd-padding">
                    <div class="div-width-cb mrg-cb">
                      <input class="form-control" id="videoSearch" placeholder="Enter Video to Search" v-on:change="onVideoSearch">
                    </div>
                    <div class="div-width-cb mrg-cb">
                      <div class="face-range-slider-slidecontainer text-align-left">
                        <input class="face-range-slider range-slider-theme-red" type="range" min="1" max="100" value="5" id="videoDurationFilter" v-on:change="onChangeDurationFilter"><label>Duration Filter: {{durationFilterValue}}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <ul class="annotation">
                  <li v-for="video in videos" :key="video[video.length-1]" class="annotation">
                        <div class="container" :id="video[video.length-1]" v-on:click="onVideoSelected(video[video.length-1])">
                          <div class="row">
                              <div class="col-sm-3">
                                <img :id="'video_'+video[video.length-1]" class="img-video-frame" src="./../assets/ph_video_1.png" alt="starting" />
                              </div>
                              <div class="col-sm-9 text-align-left">
                                Title: {{video[1]}}<br/>
                                Owner:{{video[3]}}<br/>
                                Duration:{{video[12]}}<br/>
                              </div>
                          </div>
                        </div>
                        <hr class="border-hr">
                    </li>
                </ul>
        </div>
    </div>
</template>
<script>

import axios from "axios";

export default {
  name: "VideoListView",
  created: function() {
        this.$root.$refs.VideoListView = this;
    },
  data() {
        return {
            videos:[["96830434-e9cf-47d3-a385-b90489f9358d", "f9 trailer", "fast and furious", "JAG", "junaidghauri205@gmail.com", "CC-BY-2.0", "junaidghauri205", "Wed, 21 Jul 2021 15:20:48 GMT", ".\\videos", null, "f9_trailer.mp4", null, null, null, null,0]],
            durationFilterValue : 5
        }
    },
  methods: {
    onPlayTimeChange:function () {
    },
     onVideoSearch:function () {
    },
     onChangeDurationFilter:function () {
       this.durationFilterValue = parseInt(document.getElementById("videoDurationFilter").value)
    },
    onVideoSelected: function(videoIdx) {
        console.log("inside onVideoSelected: ");
        console.log(videoIdx);
        var videoFileNameIdx = 10;
        var videoNameIdx = 1;
        this.$root.$refs.MediaPlayerView.vidFileSrc = this.videos[videoIdx][videoFileNameIdx];
        document.getElementById("media_player").src = this.videos[videoIdx][videoFileNameIdx];
        this.$root.$refs.MediaPlayerView.vidName = this.videos[videoIdx][videoNameIdx];
        this.$root.$refs.AnalysisViewerView.getVideoMetaData("media/"+this.videos[videoIdx][videoFileNameIdx],this.videos[videoIdx][videoFileNameIdx].split(".")[0]);
     }
    },
    mounted: function() {
        axios.post(this.$root.$refs.DataViewer.dbServerLink+"getAllVideoRecord").then((responce) => {
                    if(responce.data.status === this.$root.$refs.DataViewer.successStatus){
                        console.log("got getAllVideoRecord ",responce);
                        for (var i = 0; i < responce.data.result.length; i++) {
                          responce.data.result[i].push(i);
                        }
                        this.videos = responce.data.result;
                    }
                });
    }
}   

</script>


<style>
</style>
