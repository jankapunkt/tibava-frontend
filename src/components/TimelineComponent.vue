<template>
  <div>

    <table border="0px" width="100%">
      <tr height="10px">
        <th width="4%">
          <a href="#" id="timeline_playbutton"><i class="fa fa-play fa-lg text-color-grey" title="Play"></i></a>
        </th>
        <th width="4%">
          <a href="#" id="timeline_pausebutton"><i class="fa fa-pause fa-lg text-color-grey" title="Pause"></i
          ></a>
        </th>
        <th width="4%">
          <a href="#"
            ><i class="fa fa-step-backward fa-lg text-color-grey" title="Last Second"></i
          ></a>
        </th>
        <th width="4%">
          <a href="#"
            ><i class="fa fa-backward fa-lg text-color-grey" title="Prev Frame"></i
          ></a>
        </th>
        <th width="4%">
          <a href="#"><i class="fa fa-forward fa-lg text-color-grey" title="Next Frame"></i></a>
        </th>
        <th width="4%">
          <a href="#"
            ><i class="fa fa-step-forward fa-lg text-color-grey" title="Next Second"></i
          ></a>
        </th>
        <th width="4%">
          <a href="#"
            ><i class="fa fa-compress fa-lg text-color-grey" title="Merge Segments"></i
          ></a>
        </th>
        <th width="4%">
          <a href="#"><i class="fa fa-cut fa-lg text-color-grey" title="Split Segments"></i></a>
        </th>
        <th width="68%" class="text-align-right">
          <a href="#" id="zoomOut" v-on:click="zoomOut()"><i class="fa fa-search-minus fa-lg text-color-grey" title="Zoom Out"></i></a>
          <input type="range" min="1" max="100" value="100" class="zoom-slider text-color-grey" id="zoomRange" v-on:change="zoomChange()"/>
          <a href="#" id="zoomIn" v-on:click="zoomIn()"><i class="fa fa-search-plus fa-lg text-color-grey" title="Zoom In"></i></a>
        </th>
      </tr>
    </table>


  </div>

</template>

<script>

import axios from "axios";
import VideoEditingTimeline from 'video-editing-timeline';
// import VueDropdown from 'vue-dynamic-dropdown'

export default {
  mounted () {
    this.initializeButtons()
  },
  methods: {
    zoomIn:function ()  {
      document.getElementById("zoomRange").value *= 1.05;
      var percent = document.getElementById("zoomRange").value*10;
      var stlVal = "width: "+percent+"% !important";
      document.getElementById("tableShotTimeLineScrolled").style = stlVal;
    },
    zoomOut:function ()  {
      document.getElementById("zoomRange").value *= 0.95;
      var percent = document.getElementById("zoomRange").value*10;
      var stlVal = "width: "+percent+"% !important";
      document.getElementById("tableShotTimeLineScrolled").style = stlVal;
    },
    zoomChange() {
      var percent = document.getElementById("zoomRange").value*10;
      var stlVal = "width: "+percent+"% !important";
      document.getElementById("tableShotTimeLineScrolled").style = stlVal;
    },
    initializeButtons () {
      document.querySelector('#timeline_playbutton').addEventListener('click', function () {
        document.querySelector('#media_player').play()
      })
      document.querySelector('#timeline_pausebutton').addEventListener('click', function () {
        document.querySelector('#media_player').pause()
      })
    }
  },
};

</script>
<style>

</style>
