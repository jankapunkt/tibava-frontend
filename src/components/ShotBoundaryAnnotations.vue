<template>
  <div>

    <!-- moved player buttons table here to TimelineComponent-->


    <div class="global-timeline">
      <table border="0px" width="100%" id="globalTimeline">
        <tr height="15px"><th class="scene-timeline-a" colspan="100%"><canvas id='timelineGlobal' /></th></tr>
        <tr height="25px">
          <th v-for="item in curVidShotData" :key="item[shotStartFrameIdx]" class="scene-timeline-a" :width="getPercentage(item)" v-on:click="updatePlayerCurrentTime(item)">
            <!-- <div class="tooltip">
              <span class="tooltiptext"
                ><img src="./../assets/constFrame2.png" width="100px" alt=""
              /></span>
            </div> -->
          </th>
        </tr>
      </table>

    </div>
    <div class="panel-content timeline-font">
      <table style="width: 1000% !important" id="tableShotTimeLineScrolled" class="">
        <tr height="10px" class="border-top border-bottom">
          <th scope="row" :width="timelineHeadWidth" class="table-th-annotation border-down">Timelines</th>
          <td :colspan="curVidShotData.length" scope="column" class="table-th-col-annotation">
            <canvas id='timeline' />
            <div id="shot_anno_timeline_pointer" style="position: absolute; top: 25%; left: 100px; width: 16px; height:750%; background: linear-gradient(90deg, transparent 8px, rgb(255, 0, 0) 8px, rgb(255, 0, 0) 9px, transparent 9px) 0% 0% / 16px 16px repeat-y; pointer-events: none; margin-top: 16px;">
              <canvas class="play-marker" id="playMarker" width="16" height="16"></canvas>
            </div>
          </td>
        </tr>
        <!-- <tr height="10px" border="0px">
          <th scope="row" width="20px" class="table-th-annotation"><button class="w3-button" v-on:click="openTimelineEditModal()">☰</button>
          </th>
          <td :colspan="curVidShotData.length" class="table-th-fix-annotation">
            <h6 class="table-th-fix-annotation">Shots</h6>
          </td>
        </tr> -->
        <tr v-for="tmline in shotTimelines" :key="tmline.id" height="40px">
          <th scope="row" class="border-down table-th-annotation cursor-default" :width="timelineHeadWidth">
            <div class="dropup z-20-i">
                <i class="fa fa-bars cursor-pointer timeline-head-side-margin z-20-i" data-toggle="dropdown" title="Timeline options"></i>
                <ul class="timeline-dropdown dropdown-menu z-20-i">
                  <li class="z-20-i"><a href="#" class="timeline-dropdown-anchor z-20-i" v-on:click="duplicateTimeline(tmline[0],tmline[1])">Duplicate<i class="fa fa-files-o cursor-pointer timeline-head-side-margin" title="duplicate"></i></a></li>
                  <li class="z-20-i"><a href="#" class="timeline-dropdown-anchor z-20-i" v-on:click="removeTiemline(tmline[0])">Remove<i class="fa fa-trash-o cursor-pointer timeline-head-side-margin" title="remove"></i></a></li>
                  <li class="z-20-i"><a href="#" class="timeline-dropdown-anchor z-20-i" v-on:click="openTimelineEditModal(tmline[0])">Edit<i class="fa fa-edit cursor-pointer timeline-head-side-margin" title="edit"></i></a></li>
                </ul>
            </div>
          {{tmline[1]}}</th>
          <td v-if="curVidShotDataList[tmline[0]]" :colspan="curVidShotDataList[tmline[0]].length">
            <div class="timeline-container">
              <div class="cursor-pointer" v-for="item in curVidShotDataList[tmline[0]]" :key="item[shotStartFrameIdx]" :style="'width: '+getPercentage(item)+' !important; height: 40px'" @click.self="openModal(tmline[1],item[annotationIdColIdx])">
                <button v-if="item[annotationNameColIdx] !=''" class="annotation-text-wrap annotation-tags-btn" v-on:click="deleteAnnotationValue(tmline[1],item[annotationIdColIdx])">
                  {{ item[annotationNameColIdx] }}<i class="fa fa-times pd-fa-icon"></i>
                </button>
              </div>
            </div>
          </td>
        </tr>

      <!-- commented out: added faceClustering 
        <tr v-for="faceLine in faceClustering" :key="faceLine.id" height="40px">
          <th scope="row" class="border-down table-th-annotation cursor-default" :width="timelineHeadWidth">
            <div class="dropup z-20-i">
                <i class="fa fa-bars cursor-pointer timeline-head-side-margin z-20-i" data-toggle="dropdown" title="delet timeline"></i>
                <ul class="timeline-dropdown dropdown-menu z-20-i">
                  <li class="z-20-i"><a href="#" class="timeline-dropdown-anchor z-20-i" v-on:click="duplicateTimeline(tmline[0],tmline[1])">Duplicate<i class="fa fa-files-o cursor-pointer timeline-head-side-margin" title="duplicate"></i></a></li>
                  <li class="z-20-i"><a href="#" class="timeline-dropdown-anchor z-20-i" v-on:click="removeTiemline(tmline[0])">Remove<i class="fa fa-trash-o cursor-pointer timeline-head-side-margin" title="remove"></i></a></li>
                  <li class="z-20-i"><a href="#" class="timeline-dropdown-anchor z-20-i" v-on:click="openTimelineEditModal(tmline[0])">Edit<i class="fa fa-edit cursor-pointer timeline-head-side-margin" title="edit"></i></a></li>
                </ul>
            </div>
          {{faceLine.cluster_id}}</th>
          <td :colspan="curVidShotData.length">
            <div class="timeline-container">
              <div class="cursor-pointer" v-for="item in faceClustering.frame_ids" :key="item[shotStartFrameIdx]" :style="'width: '+getPercentage(item)+' !important;'" v-on:click="openModal(tmline[1],item[annotationIdColIdx])">
                <button v-if="item[annotationNameColIdx] !=''" class="annotation-text-wrap annotation-tags-btn">
                  {{ item[annotationNameColIdx] }}<i class="fa fa-times pd-fa-icon"></i>
                </button>
              </div>
            </div>
          </td>
        </tr>
-->


      </table>
<div id="notifikation"></div>
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
                  <label for="dd_annotation_category"> Update Timeline Category</label>
                </div>
                <div class="col-sm-4">
                  <div class="dropdown" id="dd_annotation_category" name="dd_annotation_category">
                    <button type="button" class="btn btn-primary dropdown-toggle col-sm-12" id="dd_annotation_category_button_in_timeline" data-toggle="dropdown">
                      Select Category
                    </button>
                    <div class="dropdown-menu">
                      <input type="hidden" id="dd_annotation_category_value" name="" value="">
                      <input type="hidden" id="dd_timeline_id" name="" value="">
                      <a class="dropdown-item" v-for="category in category_names" :key="category[0]" :id="category[0]" :value="category[1]" href="#" v-on:click="onChangeAnnotationCategoryInTimeline($event,category)">{{category[1]}}</a>
                    </div>
                  </div>
                </div>
                <div class="col-sm-3">
                    <button type="button" class="btn btn-primary" id="newTimeline" v-on:click="updateTimeline()">Update</button>
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
                    v-on:click="selectSaveAnnotationItem()"
                  >
                    Save
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
// import VueDropdown from 'vue-dynamic-dropdown'

export default {
  name: "ShotBoundaryView",
  props: ["vidMetadata"],
  created: function () {
    this.$root.$refs.ShotBoundaryView = this;
  },
/*   components: {
    VueDropdown
  }, */
  data() {
    return {
      durationMax: 0,
      editingTimelineId:"",
      annotationTimelineId:"",
      annotationCategory:"",
      shotSeqIdx:4,
      shotStartFrameIdx:1,
      shotEndFrameIdx:2,
      shotStartTimeIdx:5,
      shotEndTimeIdx:6,
      annotationNameColIdx:7,
      annotationIdColIdx:0,
      currSegmentId:"",
      currAnnotationItemName:"",
      masterTimelineName:"Shots",
      item_names : [["1","item1"],["2","item2"],["3","item3"]],
      category_names : [["1","category 1"],["2","category 2"],["3","category 3"]],
      durationIndexes:[0,1,2],
      shotTimelines:[["1","Default","1","1"]],
      fps: 24,
      timelineHeadWidth:"120px",
      timeLineZoomStyle :"width: 1000% !important",
      timeLineZoomStyleVal:1000,
      curVidShotData: [["",0,42,"",2,"",""] ],
      curVidShotDataList:{},
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
     faceClustering: [
        {
          cluster_id: 26,
          face_ids: [
            0, 10, 12, 14, 18, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525,
            526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 591, 597, 618,
            621,
          ],
          frame_ids: [
            39, 157, 158, 159, 161, 762, 763, 764, 765, 766, 767, 768, 769, 770,
            771, 772, 773, 774, 775, 776, 777, 777, 778, 779, 780, 982, 984,
            994, 995,
          ],
          occurrences: 29,
          color: [
            Math.floor(Math.random() * 130 + 130),
            Math.floor(Math.random() * 130 + 130),
            Math.floor(Math.random() * 130 + 130),
          ],
        },
        {
          cluster_id: 9,
          face_ids: [1],
          frame_ids: [118],
          occurrences: 1,
          color: [
            Math.floor(Math.random() * 130 + 130),
            Math.floor(Math.random() * 130 + 130),
            Math.floor(Math.random() * 130 + 130),
          ],
        },
      ],
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
                this.$notifikation.success({
                  message: 'New Timeline Created Successfully.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
                  document.getElementById("timelineOptionsModal").style.display = "none";
                  this.getAllTimelines();
                  document.getElementById("category_name_dd").value = "";
              }else{
                this.$notifikation.error({
                  message: 'New Timeline Not Created.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
              }
          });
    },
    removeTiemline:function(timelineId){
      var payload = {"obj":{"timelineId":timelineId}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"deleteTimeline", payload).then((res) => {
              console.log("on: addNewTimeline: ");
              console.log(res);
              if(res.data["status"] == 200){
                this.$notifikation.success({
                  message: 'Timeline Removed.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
                this.getAllTimelines();
              }else{
                this.$notifikation.error({
                  message: 'Removal of Timeline failed.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
              }
          });
    },
    duplicateTimeline:function(timelineId,timelineCategory){
      var payload = {"obj":{"timelineId":timelineId,"timelineCategory":timelineCategory,"videoId":"d626619f-668f-4fd3-8df0-0ffdf86800bf"}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"saveTimeline", payload).then((res) => {
              console.log("on: addNewTimeline: ");
              console.log(res);
              if(res.data["status"] == 200){
                this.$notifikation.success({
                  message: 'Timeline Duplicated.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
                  document.getElementById("timelineOptionsModal").style.display = "none";
                  this.getAllTimelines();
                  document.getElementById("category_name_dd").value = "";
              }else{
                this.$notifikation.error({
                  message: 'Duplication of Timeline failed.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
              }
          });
    },
    updateTimeline:function(){
      var category_name = document.getElementById("dd_annotation_category_button_in_timeline").innerText;
      var timelineId = document.getElementById("dd_timeline_id").value;
      var payload = {"obj":{"category_name":category_name,"timeline_id":timelineId}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"updateTimeline", payload).then((res) => {
              console.log("on: addNewTimeline: ");
              console.log(res);
              if(res.data["status"] == 200){
                this.$notifikation.success({
                  message: 'Timeline Updated.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
                  document.getElementById("timelineOptionsModal").style.display = "none";
                  this.getAllTimelines();
                  document.getElementById("category_name_dd").value = "";
              }else{
                this.$notifikation.error({
                  message: 'Update of Timeline failed.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
              }
          });
    },
    deleteAnnotationItem(id) {
      console.log("in deleteAnnotationItem: ", id);
    },
    deleteAnnotationValue(timelineId, annotationId) {
      debugger;
      console.log("in deleteAnnotationValue annotationId: ", annotationId);
      console.log("in deleteAnnotationValue timelineId: ", timelineId);
      var payload = {"obj":{"annotationId":annotationId,"annotationItem":""}};
        axios.post(this.$root.$refs.DataViewer.dbServerLink+"updateTimelineSegment", payload).then((res) => {
              console.log("on: in deleteAnnotationValue ");
              console.log(res);
              if(res.data["status"] == 200){
                this.$notifikation.success({
                  message: 'AnnotationItem created.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
                  document.getElementById("category_name_dd").value = "";
                  this.getAllTimelines();
              }else{
                this.$notifikation.error({
                  message: 'AnnotationItem not created.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
              }
          });
    },
    selectSaveAnnotationItem() {
      console.log("in selectSaveAnnotationItem: ");
      var payload = {"obj":{"annotationId":this.currSegmentId,"annotationItem":this.currAnnotationItemName}};
        axios.post(this.$root.$refs.DataViewer.dbServerLink+"updateTimelineSegment", payload).then((res) => {
              console.log("on: in selectSaveAnnotationItem ");
              console.log(res);
              if(res.data["status"] == 200){
                this.$notifikation.success({
                  message: 'AnnotationItem saved.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
                  this.getAllAnnotationCategories();
                  this.getAllTimelines();
                  document.getElementById("category_name_dd").value = "";
                  var modal = document.getElementById("sidebarAnnotationItemsModal");
                    modal.style.display = "none";
              }else{
                this.$notifikation.error({
                  message: 'AnnotationItem not saved.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
              }
          });

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
                this.$notifikation.success({
                  message: 'Category saved.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
                  this.getAllAnnotationCategories();
                  document.getElementById("category_name_dd").value = "";
              }else{
                this.$notifikation.error({
                  message: 'Category not saved.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
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
      this.currAnnotationItemName = entry[2];
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
                this.$notifikation.success({
                  message: 'Item saved.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
                this.getAllAnnotationItems();
                document.getElementById("item_name_dd").value = "";
            }else{
                this.$notifikation.error({
                  message: 'Item not saved.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
            }
        });
      }
    },
    getAllAnnotationCategories(CategoryName="") {
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"getAllAnnotationCategories").then((res) => {
            console.log("on: getAllAnnotationCategories: ");
            console.log(res);
            if(res.data["status"] == 200){
                console.log("getAllAnnotationCategories Successfully :)");
                this.category_names = res.data.result;
                if(CategoryName!==""){
                  this.updateSelectcategoryAnnotation(CategoryName);
                }
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
                //this.getTimelineShots(this.shotTimelines[0][0]);
                for(var k=0;k<res.data.result.length;k++){
                  this.getTimelineShots(res.data.result[k][0],res.data.result[k]);
                }
                //this.getTimelineShots(res.data.result[k][0],res.data.result);
            }else{
                console.log("getAllTimelines Successfull :(");
            }
        });
    },
    openModal(CategoryName,segmentId) {
      var modal = document.getElementById("sidebarAnnotationItemsModal"); // old annotationTimelineModal
      modal.style.display = "block";
      debugger;
      this.currSegmentId = segmentId;
      this.getAllAnnotationCategories(CategoryName);
      //this.getAllAnnotationItems();

    },
    updateSelectcategoryAnnotation:function(CategoryName){
      for(var k=0;k<this.category_names.length;k++){
        if(this.category_names[k][1]===CategoryName){
          document.getElementById("dd_annotation_category_value").value = this.category_names[k][0];
        document.getElementById("dd_annotation_category_button_in_annotation").innerText = this.category_names[k][1];
        }
      }
      this.getAllAnnotationItems();
      document.getElementById("dd_annotation_category_button_in_annotation").disabled=true;
    },
    openTimelineEditModal(timelineId) {
      var modal = document.getElementById("timelineOptionsModal");
      modal.style.display = "block";
      document.getElementById("dd_timeline_id").value = timelineId;
      this.getAllAnnotationCategories();
    },
    getCurrentPlayTime() {
      return document.getElementById("media_player").currentTime;
    },
    getPercentage(item) {
      //debugger;
      var percent = 0;
      var totalFrames =
        this.curVidShotData[this.curVidShotData.length - 1][this.shotEndFrameIdx];
      percent = ((item[this.shotEndFrameIdx] - item[this.shotStartFrameIdx]) / totalFrames) * 100;
      return percent + "%";
    },
    updatePlayerCurrentTime:function(item) {
      if(item){
        var calculatedTime =
        this.curVidShotData[item[this.shotSeqIdx]][this.shotStartFrameIdx] / this.fps;
        document.getElementById("media_player").currentTime =
          parseInt(calculatedTime);
        document
          .getElementById("shot_anno_list_" + item[this.shotSeqIdx])
          .scrollIntoView({ behavior: "auto" });
        document
          .getElementById("shot_anno_timeline_1_" + item[this.shotSeqIdx])
          .scrollIntoView({ behavior: "auto", block: "end", inline: "start" });
      }else{
        document.getElementById("media_player").currentTime = document.getElementById("shot_anno_timeline_pointer").value;
      }

    },
    getTimelineShots:function(timelineId, timeline=[]){
      var payload = {"obj":{"timeline_id":timelineId}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"getTimelineSegmentsByTimelineId",payload).then((res) => {
            console.log("on: getAllAnnotationItems: ");
            console.log(res);
            if(res.data["status"] == 200){
                console.log("getTimelineShots Successfully :)");
                if(timeline[1] === this.masterTimelineName){
                  this.curVidShotData  = res.data.result;
                  //this.$root.$refs.DataViewer.curVidShotData = this.curVidShotData;
                }
                //this.curVidShotData  = res.data.result;
                this.curVidShotDataList[timelineId] = res.data.result;
                //var curVidShotDataListVar = this.curVidShotDataList;
                debugger;
                //this.curVidShotData = this.vidShotData;
                //this.$root.$refs.DataViewer.curVidShotData = this.curVidShotData;
            }else{
                console.log("getTimelineShots :(");
            }
        });
    },
    getTimelineShotsAll:function(timelines){
      var payload = {"obj":{"timeline_id":""}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"getAllTimelineSegments",payload).then((res) => {
            console.log("on: getAllAnnotationItems: ");
            console.log(res);
            if(res.data["status"] == 200){
                console.log("getTimelineShots Successfully :)");
                //for(var k=0;k<timelines.length;k++){
                  //this.curVidShotDataList[timelineId] =res.data.result;
                //}
                
            }else{
                console.log("getTimelineShots :(");
            }
        });
    },
    updateApplication: function () {
      this.$root.$refs.ShotBoundaryView.durationMax = this.vidMetadata.duration;
      console.log("duration in metadata is : ",this.vidMetadata.duration);
      this.fps = this.vidMetadata.fps;
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
        document.getElementById("dd_annotation_category_button_in_annotation").disabled="";
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
        canvasWidth: 4000,
        canvasHeight: 22,
        minimumScale: 50,
        minimumScaleTime: 1,
      }
      const videoEditingTimeline = new VideoEditingTimeline(config);
      const configGlobal = {
        el: "#timelineGlobal",
        canvasWidth: 1110,
        canvasHeight: 22,
        minimumScale: 17,
        minimumScaleTime: 1,
      }
      const videoEditingTimelineGlobal = new VideoEditingTimeline(configGlobal);
      console.log("videoEditingTimeline",videoEditingTimeline);
      console.log("videoEditingTimelineGlobal",videoEditingTimelineGlobal);
    }
  },
  mounted:function(){
    console.log('mounted')
    this.createTimeMarkImage();
    //this.createGlobaTimelineIndicator();
    this.getAllTimelines();
    this.updateApplication();
  },
  updated: function () {
    console.log('updated')
    this.updateApplication();
  },
};
</script>
<style>
@import "https://demos.jquerymobile.com/1.4.2/css/themes/default/jquery.mobile-1.4.2.min.css";
.timeline-font{
  font-size: 11px !important;
}
.timeline-container {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
}

.test2{
  line-height: 60px;
}

.timeline-container > div {
  background-color: #f1f1f1;
  border: 1px grey solid;
  text-align: center;
  line-height: 30px;
  min-height: 30px;
}
.play-marker{
  z-index: 0;
}

.z-15{
  z-index: 15;
}
.z-20{
  z-index: 20;
}
.z-20-i{
  z-index: 20 !important;
}
.z-25{
  z-index: 25;
}
.cursor-pointer{
  cursor: pointer;
}
.cursor-default{
  cursor: default;
}
.timeline-head-side-margin {
  margin-right: 5px;
  margin-left: 5px;
}

.global-timeline{
  margin-bottom: 8px;
}
.zoom-slider-align{
  text-align: right!important;
}
.timeline-dropdown-div{
  width: 25px !important;
}
.timeline-dropdown{
  font-size: 12px !important;
  color: grey !important;
  min-width: 10px !important;
  /* background-color: lightgrey !important; */
}
.timeline-dropdown-anchor{
  text-decoration: none !important;
  color: black !important;
  margin-left: 5px;
}
.timeline-dropdown-anchor:hover{
  color: #af1414 !important;
}
.annotation-text-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-height: 30px;
  max-width: 100%;
}

</style>
