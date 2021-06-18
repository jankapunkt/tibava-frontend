<template>
    <div>
        <div class="container">
            <div class="row">
                <div class="col-sm-7">
                    <MediaPlayer />
                </div>
                <div class="col-sm-5">
                    <div class="tab pd-player-tittle">
                        <button class="tablinks_1 active" name="shotDetection_1" v-on:click="openTab">SHOT DETECTION</button>
                        <button class="tablinks_1" name="faceDetection_1" v-on:click="openTab">FACE DETECTION</button>
                        <button class="tablinks_1" name="examples_1" v-on:click="openTab">EXAMPLES</button>
                    </div>
                    <div id="shotDetection_1" class="tabcontent_1">
                        <div class="cd-padding">
                            <div class="div-width-cb bg-cb-yl bg-rad-3 pd-cb mrg-cb text-align-left"><input  type="checkbox" name="cbShotBoundaries" value="shotBoundaries" onChange="" /><span class="mrg-cb">Shot Boundaries</span></div>
                            <div class="div-width-cb bg-cb-gr bg-rad-3 pd-cb mrg-cb text-align-left"><input  type="checkbox" name="cbShotBoundaries" value="annotation" onChange="" /><span class="mrg-cb">Annotations</span></div>
                            <div class="div-width-cb mrg-cb"><input class="form-control" id="shotSearch" placeholder="Enter Shot to Search" v-on:change="shotSearch"></div>
                        </div>
                        <AnnotationList :type="typeShots" :vidShotData="vid1ShotData" :vidFaceData="vid1FaceData" />
                    </div>
                    <div id="faceDetection_1" class="tabcontent_1 tabcontent">
                        <div class="cd-padding">
                            <div class="bg-cb-bl bg-rad-3 pd-cb mrg-cb div-width-cb text-align-left"><input  type="checkbox" name="cbFaceDetectors" value="faceDetectors" onChange="" /><span class="mrg-cb">Face Detectors</span></div>
                            <div class="bg-cb-gr bg-rad-3 pd-cb mrg-cb div-width-cb text-align-left"><input  type="checkbox" name="cbFaceAreaGraph" value="faceAreaGraph" onChange="" /><span class="mrg-cb">Face Area Graph</span></div>
                            <div class="div-width-cb mrg-cb"><input class="form-control" id="faceSearch" placeholder="Enter Face to Search" v-on:change="faceSearch"></div>
                        </div>
                        <AnnotationList :type="typeFaces" :vidShotData="vid1ShotData" :vidFaceData="vid1FaceData" />
                    </div>
                    <div id="examples_1" class="tabcontent_1 tabcontent">
                        <ol class="tab-box">
                            <li><a id="d7bf5513204d501ddb6ee1df8747c8436da6773ac2113bc4646111e99175427e" class="video-links" href="" >Crash Course Engineering Preview English</a></li>
                            <li><a id="2" class="video-links" href="" >Electronic Computing Crash Course Computer Science 2 English csyt</a></li>
                        </ol>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <div><ShotBoundaryAnnotations :vidShotData="vid1ShotData" :vidMetadata="vid1Metadata"/></div>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <div class="tab">
                        <button class="tab-font-lg tablinks_2 active" name="metadata_2" v-on:click="openTab">METADATA</button>
                        <button class="tab-font-lg tablinks_2" name="visualization_2" v-on:click="openTab">VISUALIZATION</button>
                    </div>
                    <div id="metadata_2" class="tabcontent_2">
                        <div ><Metadata :vidMetadata="vid1Metadata" /></div>
                    </div>
                    <div id="visualization_2" class="tabcontent_2 tabcontent">
                        <div ><FaceAnalysisGraph :vidFaceData="vid1FaceData" :vidMetadata="vid1Metadata" :vidShotData="vid1ShotData" /></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import axios from "axios";
import MediaPlayer from "./MediaPlayer";
import AnnotationList from "./AnnotationList";
//import AnnotationListFace from "./AnnotationListFace";
import ShotBoundaryAnnotations from "./ShotBoundaryAnnotations";
import FaceAnalysisGraph from "./FaceAnalysisGraph";

import Metadata from "./Metadata";
//import tempData from './../assets/tempData.json'

export default {
  name: "AnalysisViewerView",
  colLeft : "col-sm-7",
  colRight : "col-sm-5",
  loggedUser: "Junaid",
  baseUrl1: "http://localhost:5000/",
  
  created: function() {
        this.$root.$refs.AnalysisViewerView = this;
    },
  data() {  
        return {
            colLeft: "col-sm-7",
            colRight : "col-sm-5",
            typeShots : "typeShots",
            typeFaces : "typeFaces",
            jobRecallTime:2000,
            vid1Metadata:null,
            vidId:null,
            jobsInProcess:{},
            jobsCompleted:[],
            vid1ShotData : [{ 'end_frame': 71, 'end_time': '00:00:02.958', 'shot_id': 0, 'start_frame': 0, 'start_time': '00:00:00.000' }, { 'end_frame': 334, 'end_time': '00:00:13.916', 'shot_id': 1, 'start_frame': 72, 'start_time': '00:00:03.000' }, { 'end_frame': 431, 'end_time': '00:00:17.958', 'shot_id': 2, 'start_frame': 335, 'start_time': '00:00:13.958' }],
            vid1FaceData:[{"bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 72 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 73 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 74 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 75 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 76 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 77 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 78 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 79 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 80 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 81 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 82 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 83 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 84 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 85 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 86 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 87 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 88 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 89 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 90 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 91 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 92 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 93 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 94 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 95 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 96 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 97 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 98 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 99 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 100 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 101 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 102 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 103 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 104 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 105 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 106 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 107 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 108 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 109 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 110 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 261, 104, 104], "frame_idx": 111 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 112 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 261, 103, 104], "frame_idx": 113 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 261, 104, 104], "frame_idx": 114 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 261, 103, 104], "frame_idx": 115 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 261, 103, 104], "frame_idx": 116 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 117 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 118 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 119 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 120 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 121 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 122 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 123 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 124 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 125 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 126 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 127 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 128 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 129 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 130 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 131 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 132 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 133 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 134 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 135 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 136 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 137 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 138 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 139 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 140 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 141 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 142 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 143 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 144 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 145 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 146 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 147 }],
            baseUrl1:"http://127.0.0.1:5000/",
            baseUrl2: "http://127.0.0.1:5111/",
        }
    },
    components: {
        MediaPlayer,
        Metadata,
        AnnotationList,
        ShotBoundaryAnnotations,
        FaceAnalysisGraph
  },
  methods: {
    openTab: function (event){
            var tokens = event.currentTarget.name.split("_");
            var tabIdx = tokens[tokens.length - 1];
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent_" + tabIdx);
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tablinks_" + tabIdx);
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(event.target.name).style.display = "block";
            event.currentTarget.className += " active";
        },
    shotSearch:function (event){
        console.log("inside shotSearch: ");
        console.log(event.target);
    },
    faceSearch:function (event){
        console.log("inside shotSearch: ");
        console.log(event.target);
    },
    checkVideoDetectShotsDone:function (jobId,fps){
        console.log("repeating checkVideoDetectShotsDone");
        axios.get(this.baseUrl1 +"detect_shots", {params:{"job_id": jobId, "fps": fps}}).then((responceShots) => {
                    if(responceShots){
                        if(responceShots.data.status == "SUCCESS"){
                            console.log("clearing checkVideoDetectShotsDone");
                            clearInterval(this.jobsInProcess[jobId]["intervalHandler"]);
                            this.vid1ShotData = responceShots.data.shots;
                            this.$root.$refs.ShotBoundaryView.curVidShotData = this.vid1ShotData;
                        }
                    }
                });
    }
  },
  beforeMount(){
        var vidpath = "media/Crash_Course_Engineering_Preview_-_English.mp4";
        var vidTitle = "Crash_Course_Engineering_Preview_-_English";
        axios.get(this.baseUrl1 +"read_meta", {params:{"title": vidTitle, "path": vidpath}}).then((res) => {
            if(res){
                var responce = eval("(function(){return " + res.data + ";})()");
                this.vid1Metadata = responce.metadata;
                this.vidId = responce.video_id;
                axios.post(this.baseUrl1 +"detect_shots", {"video_id": responce.video_id, "path": vidpath}).then((responceShots) => {
                    if(responceShots){
                        console.log("setting checkVideoDetectShotsDone");
                        var intervalHandler = setInterval(this.checkVideoDetectShotsDone(responceShots.data.job_id,responce.metadata.fps), this.jobRecallTime);
                        this.jobsInProcess[responceShots.data.job_id] = {"type":"detect_shots","intervalHandler":intervalHandler};
                    }
                });
            }
        });
        
  }
}
</script>


<style>
@import "./AnalysisViewer.css";
</style>
