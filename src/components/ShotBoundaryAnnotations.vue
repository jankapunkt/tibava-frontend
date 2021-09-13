<template>
  <div>
    
    <table border="0px" width="100%">
      <tr height="10px">
        <th width="5%">
          <a href="#"><i class="fa fa-plus fa-2x text-color-grey" title="Add Timeline"></i></a>
        </th>
        <th width="5%">
          <a href="#"
            ><i class="fa fa-minus fa-2x text-color-grey" title="Remove Timeline"></i
          ></a>
        </th>
        <th width="5%">
          <a href="#"
            ><i class="fa fa-step-backward fa-2x text-color-grey" title="Last Second"></i
          ></a>
        </th>
        <th width="5%">
          <a href="#"
            ><i class="fa fa-backward fa-2x text-color-grey" title="Prev Frame"></i
          ></a>
        </th>
        <th width="5%">
          <a href="#"><i class="fa fa-forward fa-2x text-color-grey" title="Next Frame"></i></a>
        </th>
        <th width="5%">
          <a href="#"
            ><i class="fa fa-step-forward fa-2x text-color-grey" title="Next Second"></i
          ></a>
        </th>
        <th width="5%">
          <a href="#"
            ><i class="fa fa-compress fa-2x text-color-grey" title="Merge Segments"></i
          ></a>
        </th>
        <th width="5%">
          <a href="#"><i class="fa fa-cut fa-2x text-color-grey" title="Split Segments"></i></a>
        </th>
        <th width="50%">
          <a href="#" id="zoomOut" v-on:click="zoomOut()"><i class="fa fa-search-minus fa-lg text-color-grey" title="Zoom Out"></i></a>
          <input type="range" min="1" max="100" value="100" class="zoom-slider text-color-grey" id="zoomRange" v-on:change="zoomChange()" />
          <a href="#" id="zoomIn" v-on:click="zoomIn()"><i class="fa fa-search-plus fa-lg text-color-grey" title="Zoom In"></i></a>
        </th>
      </tr>
    </table>
    <div>
      <table border="0px" width="100%" id="globalTimeline">
        <tr height="25px">
          <th v-for="item in curVidShotData" :key="item.start_frame" class="scene-timeline-a" :width="getPercentage(item)" v-on:click="updatePlayerCurrentTime(item)">
            <div class="tooltip">
              <span class="tooltiptext"
                ><img src="./../assets/constFrame2.png" width="100px" alt=""
              /></span>
            </div>
          </th>
        </tr>
      </table>
 
    </div>
    <div class="panel-content timeline-font">
      <table style="width: 1000% !important" id="tableShotTimeLineScrolled" class="">
        <tr height="10px" class="border-top border-bottom">
          <th scope="row" width="20px" class="table-th-annotation">Timelines</th>
          <td :colspan="curVidShotData.length" scope="column" class="table-th-col-annotation">
            <canvas id='timeline' />
            <div style="position: absolute; top: 25%; left: 100px; width: 16px; height: 600%; background: linear-gradient(90deg, transparent 8px, rgb(255, 0, 0) 8px, rgb(255, 0, 0) 9px, transparent 9px) 0% 0% / 16px 16px repeat-y; pointer-events: none; margin-top: 16px;">
              <canvas class="play-marker" id="playMarker" width="16" height="16"></canvas>
            </div> 
          </td>
        </tr>
        <tr height="10px" border="0px">
          <th scope="row" width="20px" class="table-th-annotation"><button class="w3-button" v-on:click="openTimelineOptionsModal()">☰</button>
          </th>
          <td :colspan="curVidShotData.length" class="table-th-fix-annotation">
            <h6 class="table-th-fix-annotation">Shots</h6>
          </td>
        </tr>
        <tr v-for="tmline in shotTimelines" :key="tmline[0]" height="40px">
          <th scope="row" class="table-th-annotation" width="20px">{{tmline[1]}}<i v-if="tmline[1] !== 'Default'" v-on:click="removeTiemline(tmline[0])" class="fa fa-times text-color-theme-red cursor-pointer" title="delet timeline"></i></th>
          <td :colspan="curVidShotData.length">
            <div class="timeline-container">
              <div v-for="item in curVidShotData" :key="item.start_frame" :style="'width: '+getPercentage(item)+' !important;'" v-on:click="openModal()">1</div>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div>
    </div>
    <div id="timelineOptionsModal" class="modal">
      <div class="modal-content">
        <span class="timelineOptionsModalClose text-align-right list-item-pointer"
          >&times;</span
        >
        <div class="container">
          <div class="row">
            <div class="col-sm-12">
              <div class="form-group row">
                <div class="col-sm-5">
                  <label for="dd_annotation_category"> Category of New Timeline</label>
                </div>
                <div class="col-sm-4">
                  <div class="dropdown" id="dd_annotation_category" name="dd_annotation_category">
                    <button type="button" class="btn btn-primary dropdown-toggle col-sm-12" id="dd_annotation_category_button_in_timeline" data-toggle="dropdown">
                      Select Category
                    </button>
                    <div class="dropdown-menu">
                      <input type="hidden" id="dd_annotation_category_value" name="" value="">
                      <a class="dropdown-item" v-for="category in category_names" :key="category[0]" :id="category[0]" :value="category[1]" href="#" v-on:click="onChangeAnnotationCategoryInTimeline($event,category)">{{category[1]}}</a>
                    </div>
                  </div>
                </div>
                <div class="col-sm-3">
                    <button type="button" class="btn btn-primary" id="newTimeline" v-on:click="addNewTimeline()">Add New</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="sidebarAnnotationItemsModal" class="modal">
      <div class="modal-content">
        <span class="sidebarAnnotationItemsModalClose text-align-right list-item-pointer"
          >&times;</span
        >
        <div class="container">
          <div class="row">
            <div class="col-sm-12">
              <div class="form-group row">
                <div class="col-sm-5">
                  <div class="dropdown" id="dd_annotation_category">
                    <button type="button" class="btn btn-primary dropdown-toggle col-sm-12" id="dd_annotation_category_button_in_annotation" data-toggle="dropdown">
                      Select Category
                    </button>
                    <div class="dropdown-menu">
                      <input type="hidden" id="dd_annotation_category_value" name="" value="">
                      <a class="dropdown-item" v-for="category in category_names" :key="category[0]" :id="category[0]" :value="category[1]" href="#" v-on:click="onChangeAnnotationCategoryInAnnotation($event,category)">{{category[1]}}</a>
                      <div><input class="" id="category_name_dd" placeholder="New Category"><i class="fa fa-plus-circle fa-lg green" title="New Category" v-on:click="saveAnnotationCategory"></i></div>
                    </div>
                  </div>
                </div>
                <div class="col-sm-5">
                  <div class="dropdown" id="dd_annotation_item">
                    <button type="button" class="btn btn-primary dropdown-toggle col-sm-12" id="dd_annotation_item_button" data-toggle="dropdown">
                      Select Item
                    </button>
                    <div class="dropdown-menu">
                      <input type="hidden" id="dd_annotation_item_value" name="" value="">
                      <a class="dropdown-item" v-for="item in item_names" :key="item[0]" :id="item[0]" :value="item[2]" href="#" v-on:click="onChangeAnnotationItem($event,item)">{{item[2]}}</a>
                      <div><input class="" id="item_name_dd" placeholder="New Item"><i class="fa fa-plus-circle fa-lg green" title="New Item" v-on:click="saveAnnotationItem"></i></div>
                    </div>
                  </div>
                </div>
                <div class="col-sm-2">
                  <button
                    class="btn btn-primary"
                    v-on:click="selectAnnotationItem()"
                  >
                    Select
                  </button>
                </div>
              </div>
              
            </div>
          </div>
          
          <div class="row">
            <h4 class="text-align-left">Annotations Items</h4>
            <table width="100%" class="text-color">
              <tbody>
                <tr class="border-down">
                  <th class="text-align-left">Item Id</th>
                  <th class="text-align-left">Catagory</th>
                  <th class="text-align-left">Name</th>
                  <th class="text-align-left">Added By</th>
                  <th class="text-align-center">Delete</th>
                </tr>
                <tr
                  v-for="item in annotationcItems"
                  :key="item[0]"
                  class="border-down"
                  height="40px"
                  width="100%"
                >
                  <th class="text-align-left">{{ item[0] }}</th>
                  <th class="text-align-left">{{ item[1] }}</th>
                  <th class="text-align-left">{{ item[2] }}</th>
                  <th class="text-align-left">{{ item[3] }}</th>
                  <th class="text-align-center">
                    <a href="#" v-on:click="deleteAnnotationItem(item.id)"
                      ><i class="fa fa-trash fa-lg red"></i
                    ></a>
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
          <br />
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import VideoEditingTimeline from 'video-editing-timeline';

export default {
  name: "ShotBoundaryView",
  props: ["vidShotData", "vidMetadata"],
  created: function () {
    this.$root.$refs.ShotBoundaryView = this;
  },
  data() {
    return {
      durationMax: 0,
      item_names : [["1","item1"],["2","item2"],["3","item3"]],
      category_names : [["1","category 1"],["2","category 2"],["3","category 3"]],
      durationIndexes:[0,1,2],
      shotTimelines:[["1","Default","1","1"]],
      fps: 24,
      timeLineZoomStyle :"width: 1000% !important",
      timeLineZoomStyleVal:1000,
      curVidShotData: [
        {
          end_frame: 71,
          end_time: "00:00:02.958",
          shot_id: 0,
          start_frame: 0,
          start_time: "00:00:00.000",
        },
      ],
      annotationcItems: [],
       events: [{
          name: "event 1",
          start: new Date(2020, 1,1),
          end: new Date(2020, 1,4),
      },{
          name: "event 2",
          start: new Date(2020, 1,2),
          end: new Date(2020, 1,5),
      },{
          name: "event 3",
          start: new Date(2020, 1,3),
          end: new Date(2020, 1,10),
      }],
     gSliderData:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    };
  },
  methods: {
    onPlayTimeChange(event) {
      console.log("shotBoudary Platime changed: ");
      console.log(event.target.currentTime);
      document.getElementById("shot_anno_timeline_pointer").value =
        event.target.currentTime;
    },
    gSliderDataFunction() {
    return {
      data: this.gSliderData.map((d) => new Date(d)),
    };
    },
    createTimeMarkImage:function () {
		var canvas = document.getElementById("playMarker");
		var context = canvas.getContext("2d");
		context.fillStyle = "#af1414";
		context.beginPath();
		context.moveTo( 2, 0 );
		context.lineTo( 14, 0 );
		context.lineTo( 14, 10 );
		context.lineTo( 8, 16 );
		context.lineTo( 2, 10 );
		context.lineTo( 2, 0 );
		context.fill();
	},
   createGlobaTimelineIndicator:function () {
		var canvas = document.getElementById("glbIndic");
		var context = canvas.getContext("2d");
		context.fillStyle = "#af1414";
		context.beginPath();
		context.moveTo( 2, 0 );
		context.lineTo( 14, 0 );
		context.lineTo( 14, 10 );
		context.lineTo( 8, 16 );
		context.lineTo( 2, 10 );
		context.lineTo( 2, 0 );
		context.fill();
	},
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
    addNewTimeline:function ()  {
      var category_name = document.getElementById("dd_annotation_category_button_in_timeline").innerText;
      var payload = {"obj":{"name":category_name,"video_id":"d626619f-668f-4fd3-8df0-0ffdf86800bf"}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"saveTimeline", payload).then((res) => {
              console.log("on: addNewTimeline: ");
              console.log(res);
              if(res.data["status"] == 200){
                  alert("New Timeline Successfully :)");
                  document.getElementById("timelineOptionsModal").style.display = "none";
                  this.getAllTimelines();
                  document.getElementById("category_name_dd").value = "";
              }else{
                  alert("New Timeline Not Successfully :(");
              }
          });
    },
    removeTiemline:function(timelineId){
      var payload = {"obj":{"timelineId":timelineId}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"deleteTimeline", payload).then((res) => {
              console.log("on: addNewTimeline: ");
              console.log(res);
              if(res.data["status"] == 200){
                  alert("removed Successfully :)");
                  this.getAllTimelines();
              }else{
                  alert("removed Not Successfully :(");
              }
          });
    },
    deleteAnnotationItem(id) {
      console.log("in deleteAnnotationItem: ", id);
    },
    selectAnnotationItem(id) {
      console.log("in selectAnnotationItem: ", id);
    },
    saveAnnotationCategory() {
      var category_name = document.getElementById("category_name_dd").value;
      if(category_name !== ""){
        console.log("in saveAnnotationCategory console: ", category_name);
        var payload = {"obj":{"category":category_name}};
        axios.post(this.$root.$refs.DataViewer.dbServerLink+"saveAnnotationCategory", payload).then((res) => {
              console.log("on: saveAnnotationCategory: ");
              console.log(res);
              if(res.data["status"] == 200){
                  alert("category saved Successfully :)");
                  this.getAllAnnotationCategories();
                  document.getElementById("category_name_dd").value = "";
              }else{
                  alert("category Not Successfully :(");
              }
          });
      }
      
    },
    onChangeAnnotationCategoryInTimeline(event,entry){
      document.getElementById("dd_annotation_category_value").value = event.target.id;
      document.getElementById("dd_annotation_category_button_in_timeline").innerText = entry[1];
      this.getAllAnnotationItems();
      
    },
    onChangeAnnotationCategoryInAnnotation(event,entry){
      document.getElementById("dd_annotation_category_value").value = event.target.id;
      document.getElementById("dd_annotation_category_button_in_annotation").innerText = entry[1];
      this.getAllAnnotationItems();
      
    },
    onChangeAnnotationItem(event,entry){
      document.getElementById("dd_annotation_item_value").value = event.target.id;
      document.getElementById("dd_annotation_item_button").innerText = entry[2];
    },
    saveAnnotationItem() {
      var item_name = document.getElementById("item_name_dd").value;
      var categoryId = document.getElementById("dd_annotation_category_value").value;
      if(categoryId !== "" && item_name!== ""){
      console.log("in saveAnnotationItem console: ", item_name);
      var payload = {"obj":{"item":item_name,"category":categoryId}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"saveAnnotationItem", payload).then((res) => {
            console.log("on: saveAnnotationItem: ");
            console.log(res);
            if(res.data["status"] == 200){
                alert("item saved Successfully :)");
                this.getAllAnnotationItems();
                document.getElementById("item_name_dd").value = "";
            }else{
                alert("item Not Successfull :(");
            }
        });
      }
    },
    getAllAnnotationCategories() {
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"getAllAnnotationCategories").then((res) => {
            console.log("on: getAllAnnotationCategories: ");
            console.log(res);
            if(res.data["status"] == 200){
                console.log("getAllAnnotationCategories Successfully :)");
                this.category_names = res.data.result;
            }else{
                console.log("getAllAnnotationCategories Successfull :(");
            }
        });
    },
    getAllAnnotationItems() {
      var payload = {"obj":{"category":document.getElementById("dd_annotation_category_value").value}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"getAllAnnotationItems",payload).then((res) => {
            console.log("on: getAllAnnotationItems: ");
            console.log(res);
            if(res.data["status"] == 200){
                console.log("getAllAnnotationItems Successfully :)");
                this.item_names = res.data.result;
                this.annotationcItems = res.data.result;
            }else{
                console.log("getAllAnnotationItemsSuccessfull :(");
            }
        });
    },
    getAllTimelines() {
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"getAllTimelines").then((res) => {
            console.log("on: getAllTimelines: ");
            console.log(res);
            if(res.data["status"] == 200){
                console.log("getAllTimelines Successfully :)");
                this.shotTimelines = res.data.result;
            }else{
                console.log("getAllTimelines Successfull :(");
            }
        });
    },
    openModal() {
      var modal = document.getElementById("sidebarAnnotationItemsModal"); // old annotationTimelineModal
      modal.style.display = "block";
      this.getAllAnnotationCategories();
      this.getAllAnnotationItems();
    },
    openTimelineOptionsModal() {
      var modal = document.getElementById("timelineOptionsModal"); 
      modal.style.display = "block";
      this.getAllAnnotationCategories();
    },
    getCurrentPlayTime() {
      return document.getElementById("media_player").currentTime;
    },
    getPercentage(item) {
      var percent = 0;
      var totalFrames =
        this.curVidShotData[this.curVidShotData.length - 1].end_frame;
      percent = ((item.end_frame - item.start_frame) / totalFrames) * 100;
      return percent + "%";
    },
    updatePlayerCurrentTime(item) {
      if(item){
        var calculatedTime =
        this.curVidShotData[item.shot_id].start_frame / this.fps;
        document.getElementById("media_player").currentTime =
          parseInt(calculatedTime);
        document
          .getElementById("shot_anno_list_" + item.shot_id)
          .scrollIntoView({ behavior: "auto" });
        document
          .getElementById("shot_anno_timeline_1_" + item.shot_id)
          .scrollIntoView({ behavior: "auto", block: "end", inline: "start" });
      }else{
        document.getElementById("media_player").currentTime = document.getElementById("shot_anno_timeline_pointer").value; 
      }
      
    },
  },
  mounted:function(){
    this.getAllTimelines();
    this.createTimeMarkImage();
    //this.createGlobaTimelineIndicator(); 
  },
  updated: function () {
    this.$root.$refs.ShotBoundaryView.durationMax = this.vidMetadata.duration;
    console.log("duration in metadata is : ",this.vidMetadata.duration);
    this.fps = this.vidMetadata.fps;
    this.curVidShotData = this.vidShotData;
    this.$root.$refs.DataViewer.curVidShotData = this.curVidShotData;
    this.$root.$refs.AnnotationListView.updateShotsList();
    var acc = document.getElementsByClassName("accordion");
    var i;
    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function () {
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
    var span = document.getElementsByClassName(
      "sidebarAnnotationItemsModalClose"
    )[0]; 
    span.onclick = function () {
      modal.style.display = "none";
    };
    var modal2 = document.getElementById("timelineOptionsModal");
    var span2 = document.getElementsByClassName(
      "timelineOptionsModalClose"
    )[0]; 
    span2.onclick = function () {
      modal2.style.display = "none";
    };
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
        modal2.style.display = "none";
      }
    };
    const config = {
    el: "#timeline",
    canvasWidth: 1000,
    canvasHeight: 30,
    minimumScale: 10, 
    minimumScaleTime: 1, 
    }
    const videoEditingTimeline = new VideoEditingTimeline(config);
    console.log("videoEditingTimeline",videoEditingTimeline);
  },
};
</script>
<style>
@import "https://demos.jquerymobile.com/1.4.2/css/themes/default/jquery.mobile-1.4.2.min.css";
.timeline-font{
  font-size: 10px !important;
}
.timeline-container {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
}

.timeline-container > div {
  background-color: #f1f1f1;
  border: 1px grey solid;
  text-align: center;
  line-height: 30px;
}
.play-marker{
  z-index: 0;
}

.z-20{
  z-index: 20;
}
.cursor-pointer{
  cursor: pointer;
}


</style>
