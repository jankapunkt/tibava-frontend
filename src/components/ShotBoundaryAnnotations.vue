<template>
  <div>
    <table border="0px" width="100%">
      <tr height="25px">
        <th
          v-for="item in curVidShotData"
          :key="item.start_frame"
          class="scene-timeline-a"
          :width="getPercentage(item)"
          v-on:click="updatePlayerCurrentTime(item)"
        >
          <div class="tooltip">
            <span class="tooltiptext"
              ><img src="./../assets/constFrame2.png" width="100px" alt=""
            /></span>
          </div>
        </th>
      </tr>
    </table>
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
          <input type="range" min="1" max="100" value="100" class="zoom-slider text-color-grey" id="zoomRange" v-on:change="zoomChange()">
          <a href="#" id="zoomIn" v-on:click="zoomIn()"><i class="fa fa-search-plus fa-lg text-color-grey" title="Zoom In"></i></a>
        </th>
      </tr>
    </table>
    <div class="panel-content">
      <table style="width: 1000% !important" id="tableShotTimeLineScrolled" border="1px" class="">
        <tr height="10px">
          <th width="20px" class="pos-sticky">Timeline #</th>
          <th :colspan="curVidShotData.length">
            <input
              id="shot_anno_timeline_pointer"
              type="range"
              min="1"
              :max="durationMax"
              :value="0"
              style="width: 100% !important"
              class="slider-annotation-timeline-pointer"
              v-on:change="updatePlayerCurrentTime(null)"
            />
          </th>
        </tr>
        <tr height="50px">
          <th width="20px">T-1</th>
          <th
            v-for="item in curVidShotData"
            :key="item.start_frame"
            :width="getPercentage(item)"
            v-on:click="openModal()"
            :id="'shot_anno_timeline_1_' + item.shot_id"
          >
            <div v-for="item in getRandomWordList()" :key="item">
              <button class="annotation-tags-btn">
                {{ item }}<i class="fa fa-times"></i>
              </button>
            </div>
          </th>
        </tr>
      </table>
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
                    <button type="button" class="btn btn-primary dropdown-toggle col-sm-12" id="dd_annotation_category_button" data-toggle="dropdown">
                      Select Category
                    </button>
                    <div class="dropdown-menu">
                      <input type="hidden" id="dd_annotation_category_value" name="" value="">
                      <a class="dropdown-item" v-for="category in category_names" :key="category[0]" :id="category[0]" :value="category[1]" href="#" v-on:click="onChangeAnnotationCategory($event,category)">{{category[1]}}</a>
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
    };
  },
  methods: {
    onPlayTimeChange(event) {
      console.log("shotBoudary Platime changed: ");
      console.log(event.target.currentTime);
      document.getElementById("shot_anno_timeline_pointer").value =
        event.target.currentTime;
    },
    zoomIn() {
      document.getElementById("zoomRange").value *= 1.05;
      var percent = document.getElementById("zoomRange").value*10;
      var stlVal = "width: "+percent+"% !important";
      document.getElementById("tableShotTimeLineScrolled").style = stlVal;
      //this.$root.$refs.ShotBoundaryView.timeLineZoomStyle = stlVal;
      //this.timeLineZoomStyleVal= stlVal;
    },
    zoomOut() {
      document.getElementById("zoomRange").value *= 0.95;
      var percent = document.getElementById("zoomRange").value*10;
      var stlVal = "width: "+percent+"% !important";
      document.getElementById("tableShotTimeLineScrolled").style = stlVal;
      //this.$root.$refs.ShotBoundaryView.timeLineZoomStyle = stlVal;
      //this.timeLineZoomStyleVal= stlVal;
    },
    zoomChange() {
      var percent = document.getElementById("zoomRange").value*10;
      var stlVal = "width: "+percent+"% !important";
      document.getElementById("tableShotTimeLineScrolled").style = stlVal;
      //this.$root.$refs.ShotBoundaryView.timeLineZoomStyle = stlVal;
      //this.timeLineZoomStyleVal= stlVal;
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
                  alert("category Not Successfull :(");
              }
          });
      }
      
    },
    onChangeAnnotationCategory(event,entry){
      document.getElementById("dd_annotation_category_value").value = event.target.id;
      this.getAllAnnotationItems();
      document.getElementById("dd_annotation_category_button").innerText = entry[1];
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
                console.log("item saved Successfully :)");
                this.category_names = res.data.result;
            }else{
                console.log("item Not Successfull :(");
            }
        });
    },
    getAllAnnotationItems() {
      var payload = {"obj":{"category":document.getElementById("dd_annotation_category_value").value}};
      axios.post(this.$root.$refs.DataViewer.dbServerLink+"getAllAnnotationItems",payload).then((res) => {
            console.log("on: getAllAnnotationItems: ");
            console.log(res);
            if(res.data["status"] == 200){
                console.log("item saved Successfully :)");
                this.item_names = res.data.result;
                this.annotationcItems = res.data.result;
            }else{
                console.log("item Not Successfull :(");
            }
        });
    },
    openModal() {
      var modal = document.getElementById("sidebarAnnotationItemsModal"); // old annotationTimelineModal
      modal.style.display = "block";
      //document.getElementById("item_name").value = "";
      //document.getElementById("category_name").value = "";
      this.getAllAnnotationCategories();
      this.getAllAnnotationItems();
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
    getRandomWordFilled() {
      var listWords = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "close camera",
        "far camera",
        "person 1",
        "person 2",
      ];
      return listWords[Math.floor(Math.random() * 15)];
    },
    getRandomWordList() {
      var listWords = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        ["person 1"],
        ["close camera"],
        ["far camera"],
        ["normal camera"],
        ["close camera",],
      ];
      return listWords[Math.floor(Math.random() * 15)];
    },
    getRandomDecision() {
      var listWords = [true, false];
      return listWords[Math.floor(Math.random() * 1)];
    },
    getTrueFalse() {
      var listWords = [
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
      ];
      return listWords[Math.floor(Math.random() * 15)];
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
    )[0]; // old close
    span.onclick = function () {
      modal.style.display = "none";
    };
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  },
};
</script>


<style>
</style>
