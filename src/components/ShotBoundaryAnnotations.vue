<template>
    <div>
        <table border='0px' width="100%">
                <tr height="25px">
                    <th v-for="item in curVidShotData" :key="item.start_frame" class="scene-timeline-a" :width="getPercentage(item)" v-on:click="updatePlayerCurrentTime(item)"><div class="tooltip"><span class="tooltiptext"><img src="./../assets/constFrame2.png" width="100px" alt="" /></span></div></th>
                </tr>
        </table>
        <table border='0px' width="50%">
                <tr height="10px">
                    <th width="10%"><a href="#"><i class="fa fa-plus fa-2x"></i></a></th>
                    <th width="10%"><a href="#"><i class="fa fa-minus fa-2x"></i></a></th>
                    <th width="10%"><a href="#"><i class="fa fa-step-backward fa-2x"></i></a></th>
                    <th width="10%"><a href="#"><i class="fa fa-backward fa-2x"></i></a></th>
                    <th width="10%"><a href="#"><i class="fa fa-forward fa-2x"></i></a></th>
                    <th width="10%"><a href="#"><i class="fa fa-step-forward fa-2x"></i></a></th>
                    <th width="10%"><a href="#"><i class="fa fa-compress fa-2x"></i></a></th>
                    <th width="10%"><a href="#"><i class="fa fa-cut fa-2x"></i></a></th>
                </tr>
        </table>
        <div class="panel-content">    
            <table style="width:250% !important;" border='1px' class="">
                <tr height="10px">
                    <th width="3.5%" class="pos-sticky">Timeline #</th>
                    <th :colspan="curVidShotData.length"><input id="shot_anno_timeline_pointer" type="range" min="1" :max="durationMax" :value="0" style="width:100% !important;" class="slider-annotation-timeline-pointer"></th>
                </tr>
                <tr height="50px">
                    <th width="3.5%">T-1</th>
                    <th v-for="item in curVidShotData" :key="item.start_frame" :width="getPercentage(item)" v-on:click="openModal()" :id="'shot_anno_timeline_1_'+item.shot_id"><div :v-if="getRandomWord()!==''"><button class="annotation-tags-btn">{{getRandomWord()}}<i class="fa fa-times"></i></button></div></th>
                </tr>
            </table>
        </div>
        <div id="sidebarAnnotationItemsModal" class="modal">
            <div class="modal-content">
                <span class="sidebarAnnotationItemsModalClose text-align-right">&times;</span>
                <div class="container">
                    <div class="row">
                        <h4 class="text-align-left">Annotations Items</h4>
                        <table width="100%" class="text-color">
                            <tbody>
                                <tr class="border-down">
                                    <th class="text-align-center">Item #</th>
                                    <th class="text-align-left">Annotation Catagory</th>
                                    <th class="text-align-left">Annotation Name</th>
                                    <th class="text-align-left">Added By</th>
                                    <th class="text-align-center">Detect</th>
                                    <th class="text-align-center">Select For Inserion</th>
                                </tr>
                                <tr v-for="item in annotationcItems" :key="item.id" class="border-down" height="40px" width="100%">
                                    <th class="text-align-center">{{item.id}}</th>
                                    <th class="text-align-left">{{item.category}}</th>
                                    <th class="text-align-left">{{item.item}}</th>
                                    <th class="text-align-left">{{item.addedBy}}</th>
                                    <th class="text-align-center"><a href="#" v-on:click="deleteAnnotationItem(item.id)"><i class="fa fa-trash fa-lg red"></i></a></th>
                                    <th class="text-align-center"><a href="#" v-on:click="selectAnnotationItem(item.id)"><i class="fa fa-check fa-lg green"></i></a></th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <br/>
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="form-group row">
                                <div class="col-sm-3">
                                    <input class="form-control new_item_inputs" id="itemCategory" name="category" placeholder="Annotation Category">
                                </div>
                                <div class="col-sm-3">
                                    <input class="form-control new_item_inputs" id="itemName" name="item" placeholder="Annotation Name">
                                </div>
                                <div class="col-sm-3">
                                    <input class="form-control new_item_inputs" id="user" name="addedBy" placeholder="Added By">
                                </div>
                                <div class="col-sm-3">
                                    <button class="btn btn-primary" v-on:click="saveAnnotationItem()">Add New</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ShotBoundaryView",
  props: ["vidShotData","vidMetadata"],
  created: function() {
        this.$root.$refs.ShotBoundaryView = this;
    },
  data() {
      var annotationcItems = null; //{params:
        axios.post(this.$root.$refs.AnalysisViewerView.baseUrl2+"getAnnotationItems", {params:{ "user_id": "junaid"}}).then((res) => {
            console.log("on: getAnnotationItems: ");
            console.log(res);
            if(res){
              this.annotationcItems = res.data.annotationcItems;
            }
        });
      return {
          durationMax:0,
          fps:24,
          curVidShotData:[{ 'end_frame': 71, 'end_time': '00:00:02.958', 'shot_id': 0, 'start_frame': 0, 'start_time': '00:00:00.000' }],
          annotationcItems:annotationcItems 
      }
  },
  methods: {
      onPlayTimeChange(event) {
        console.log("shotBoudary Platime changed: ");
        console.log(event.target.currentTime);
        document.getElementById("shot_anno_timeline_pointer").value = event.target.currentTime;
      },
      deleteAnnotationItem(id){
          console.log("in deleteAnnotationItem: ",id);
      },
      selectAnnotationItem(id){
          console.log("in selectAnnotationItem: ",id);
      },
      saveAnnotationItem(){
          var allInputs = document.getElementsByClassName("new_item_inputs");
          console.log("in saveAnnotationItem console: ",allInputs);
          var newItem = {};
          for(var i=0;i<allInputs.length;i++){
            newItem[allInputs[i].name]=allInputs[i].value;
          }
          const profile = {"newAnotationItem": newItem};
          axios.post(this.$root.$refs.AnalysisViewerView.baseUrl2+"saveNewAnnotationItem", profile).then((res) => {
            console.log("on: saveNewAnnotationItem: ");
            console.log(res);
        });
      },
      openModal(){
          var modal = document.getElementById("sidebarAnnotationItemsModal"); // old annotationTimelineModal
          modal.style.display = "block";
      },
      getCurrentPlayTime(){
          return document.getElementById("media_player").currentTime;
      },
      getPercentage(item){
        var percent = 0;
        var totalFrames = this.curVidShotData[this.curVidShotData.length-1].end_frame;
        percent = ((item.end_frame - item.start_frame)/totalFrames)*100; 
        return percent+"%";
      },
      getRandomWord(){
          var listWords = ['','','','','','','','','','luminous frame','presenter face','another face'];
          return listWords[Math.floor(Math.random() * 15)];
      },
      getTrueFalse(){
          var listWords = [true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false];
          return listWords[Math.floor(Math.random() * 15)];
      },
      updatePlayerCurrentTime(item){
        var calculatedTime = this.curVidShotData[item.shot_id].start_frame/this.fps;
        document.getElementById("media_player").currentTime=parseInt(calculatedTime);
        document.getElementById("shot_anno_list_"+item.shot_id).scrollIntoView({behavior: "auto"});
        document.getElementById("shot_anno_timeline_1_"+item.shot_id).scrollIntoView({behavior: "auto", block: "end", inline: "start"});
      }
  },
  updated: function() {
      this.durationMax = this.vidMetadata.duration;
      this.fps = this.vidMetadata.fps;
      this.curVidShotData = this.vidShotData;
    var acc = document.getElementsByClassName("accordion");
    var i;
    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
            } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
            } 
        });
    }
    var modal = document.getElementById("sidebarAnnotationItemsModal"); // old annotationTimelineModal
    var span = document.getElementsByClassName("sidebarAnnotationItemsModalClose")[0]; // old close
    span.onclick = function() {
    modal.style.display = "none";
    }
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        }
    }

    
  }
}
</script>


<style>
</style>
