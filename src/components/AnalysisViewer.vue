<template>
    <div>
        <div class="container">
            <h2 class="text-color pd-player-tittle text-align-left">{{vidName}}</h2>
            <div class="row">
                <div>
                    <DataViewer />
                </div>
                <div class="col-lg-5">
                    <MediaPlayer />
                </div>
                <div class="col-lg-7">
                    <div class="tab pd-player-tittle">
                        <button class="tablinks_1 active" name="shotDetection_1" v-on:click="openTab">SHOT DETECTION</button>
                        <button class="tablinks_1" name="video_1" v-on:click="openTab">DETAILS</button>
                    </div>
                    <div id="shotDetection_1" class="tabcontent_1">
                        <AnnotationList :type="typeShots" :vidShotData="vid1ShotData" :vidFaceData="vid1FaceData" />
                    </div>
                    <div id="video_1" class="tabcontent_1 tabcontent">
                        <VideoList />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-12">
                    <div><ShotBoundaryAnnotations :vidShotData="vid1ShotData" :vidMetadata="vid1Metadata"/></div>
                </div>
            </div>
            <!-- <div class="row">
                <div class="col-lg-12">
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
            </div> -->
            <div><DataViewer/></div>
        </div>
    </div>
</template>

<script>

import axios from "axios";
import MediaPlayer from "./MediaPlayer";
import AnnotationList from "./AnnotationList";
import VideoList from "./VideoList";

//import AnnotationListFace from "./AnnotationListFace";
import ShotBoundaryAnnotations from "./ShotBoundaryAnnotations";
//import FaceAnalysisGraph from "./FaceAnalysisGraph";

//import Metadata from "./Metadata";
import DataViewer from "./DataViewer";
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
            jobRecallTime:5000,
            vid1Metadata:{ 'codec': '', 'duration': 0, 'ffmpeg_version': '', 'fps': 24.0, 'nframes': 'inf', 'path': '.mp4', 'pix_fmt': '', 'plugin': 'ffmpeg', 'size': [1280, 720], 'source_size': [1280, 720], 'title': '' },
            jobsInProcess:{},
            jobsCompleted:[],
            vid1ShotData : [{ 'end_frame': 71, 'end_time': '00:00:02.958', 'shot_id': 0, 'start_frame': 0, 'start_time': '00:00:00.000' },{ 'end_frame': 71, 'end_time': '00:00:02.958', 'shot_id': 1, 'start_frame': 0, 'start_time': '00:00:00.000' }, { 'end_frame': 334, 'end_time': '00:00:13.916', 'shot_id': 2, 'start_frame': 72, 'start_time': '00:00:03.000' }, { 'end_frame': 431, 'end_time': '00:00:17.958', 'shot_id': 3, 'start_frame': 335, 'start_time': '00:00:13.958' }],
            vid1FaceData:[{"bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 72 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 73 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 74 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 75 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 76 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 77 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 78 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 79 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 80 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 81 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 82 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 83 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 84 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 85 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 86 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 87 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 88 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 89 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 90 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 91 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 92 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 93 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 94 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 95 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 96 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 97 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 98 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 99 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 100 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 101 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 102 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 103 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 104 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 105 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 106 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 107 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 108 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 109 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 110 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 261, 104, 104], "frame_idx": 111 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 112 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 261, 103, 104], "frame_idx": 113 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 261, 104, 104], "frame_idx": 114 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 261, 103, 104], "frame_idx": 115 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 261, 103, 104], "frame_idx": 116 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 117 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 118 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 119 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 120 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [515, 273, 103, 104], "frame_idx": 121 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 122 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 123 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 124 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 125 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 126 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 127 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 128 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 129 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 130 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 131 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 132 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 133 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 134 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 135 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 136 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [535, 286, 124, 125], "frame_idx": 137 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 138 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 139 }, { "bbox_area": 0.011623264290392399, "bbox_xywh": [538, 284, 103, 104], "frame_idx": 140 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 141 }, { "bbox_area": 0.0169542096555233, "bbox_xywh": [521, 272, 125, 125], "frame_idx": 142 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 143 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 144 }, { "bbox_area": 0.011736110784113407, "bbox_xywh": [526, 273, 104, 104], "frame_idx": 145 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 146 }, { "bbox_area": 0.0168185755610466, "bbox_xywh": [507, 259, 125, 124], "frame_idx": 147 }],
            baseUrl1:"http://127.0.0.1:5000/",
            baseUrl2: "http://127.0.0.1:5111/",
            vidPath : "media/f9_scene1.mp4",
            vidFileTitle : "f9_scene1",
            vidName : "Fast & Furious 9 Trailer",
            vidId : "cf13d553ca6aefda1ecefb343b30bd04b860e21a0554ae51aaf0a41c65b666f4",
            
        }
    },
    components: {
        MediaPlayer,
        //Metadata,
        AnnotationList,
        ShotBoundaryAnnotations,
        //FaceAnalysisGraph,
        DataViewer,
        VideoList
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
    },
    getVideoMetaData:function (vidPath,vidFileTitle){
         axios.get(this.baseUrl1 +"read_meta", {params:{"title": vidFileTitle, "path": vidPath}}).then((res) => {
            if(res){
                var responce = eval("(function(){return " + res.data + ";})()");
                this.$root.$refs.AnalysisViewerView.vid1Metadata = responce.metadata;
                //this.$root.$refs.MetadataView.curMetadata = responce.metadata;
                this.$root.$refs.AnalysisViewerView.vidId = responce.video_id;
                axios.post(this.baseUrl1 +"detect_shots", {"video_id": responce.video_id, "path": vidPath}).then((responceShots) => {
                    if(responceShots){
                        console.log("setting checkVideoDetectShotsDone");
                        var intervalHandler = setInterval(this.checkVideoDetectShotsDone(responceShots.data.job_id,responce.metadata.fps), this.jobRecallTime);
                        this.jobsInProcess[responceShots.data.job_id] = {"type":"detect_shots","intervalHandler":intervalHandler};
                        axios.post(this.$root.$refs.DataViewer.dbServerLink +"updateMetadata", {"metadata": responce.metadata, "jobId": responceShots.data.job_id,"videoId":responce.video_id,"videoFileName":vidFileTitle}).then((responceUpdateMetadata) => {
                            if(responceUpdateMetadata){
                                console.log("setting responceUpdateMetadata",responceUpdateMetadata);
                            }
                        });
                    }
                });
            }
        });
    }
  },
  beforeMount(){
        //this.$root.$refs.AnalysisViewerView.vidPath = "media/Crash_Course_Engineering_Preview_-_English.mp4";
        //this.$root.$refs.AnalysisViewerView.vidFileTitle = "Crash_Course_Engineering_Preview_-_English";
        var vidPath = this.$root.$refs.AnalysisViewerView.vidPath;
        var vidFileTitle = this.$root.$refs.AnalysisViewerView.vidFileTitle;
        this.getVideoMetaData(vidPath,vidFileTitle);
        
  }
}
</script>


<style>
@import "./AnalysisViewer.css";
</style>
