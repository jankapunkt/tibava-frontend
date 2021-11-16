<template>
  <div>
    <div class="container">
      <div class="row">
        <div>
          <DataViewer />
        </div>
        <div class="col-lg-6">
          <MediaPlayer />
        </div>
        <div class="col-lg-6">
          <div class="tab pd-player-tittle">
            <button
              class="tablinks_1 active"
              name="shotDetection_1"
              v-on:click="openTab"
            >
              SHOT DETECTION
            </button>
            <button class="tablinks_1" name="video_1" v-on:click="openTab">
              DETAILS
            </button>
          </div>
          <div id="shotDetection_1" class="tabcontent_1">
            <!-- This is the panel in the upper right -->
            <AnnotationList
              :type="typeShots"
              :vidShotData="vid1ShotData"
              :vidFaceData="vid1FaceData"
            />
          </div>
          <div id="video_1" class="tabcontent_1 tabcontent">
            <VideoList />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-12">
          <div><TimelineComponent /></div>
          <!-- Added this as new part component -->
        </div>
      </div>
      <div class="row">
        <div class="col-lg-12">
          <div><ShotBoundaryAnnotations :vidMetadata="vid1Metadata" /></div>
          <!-- This is the timeline. Includes the video control buttons -->
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
      <div><DataViewer /></div>
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
import TimelineComponent from "./TimelineComponent";
//import tempData from './../assets/tempData.json'
import AppConfig from "./../../AppConfig.json";


export default {
  name: "AnalysisViewerView",
  colLeft: "col-sm-7",
  colRight: "col-sm-5",
  loggedUser: "Junaid",

  created: function () {
    this.$root.$refs.AnalysisViewerView = this;
  },

  data() {
    return {
      colLeft: "col-sm-7",
      colRight: "col-sm-5",
      typeShots: "typeShots",
      typeFaces: "typeFaces",
      firstTime: true,
      jobRecallTime: 8000,
      vid1Metadata: {
        codec: "",
        duration: 0,
        ffmpeg_version: "",
        fps: 24.0,
        nframes: "inf",
        path: ".mp4",
        pix_fmt: "",
        plugin: "ffmpeg",
        size: [1280, 720],
        source_size: [1280, 720],
        title: "",
      },
      jobsInProcess: {},
      jobsCompleted: [],
      vid1ShotData: [],
      baseUrl1: AppConfig.backendServerLink,
      baseUrl2: "http://127.0.0.1:5111/",
      vidPath: "/srv/frontend/public/f9_scene1.mp4",
      vidFileTitle: "f9_scene1",
      vidName: "Fast & Furious 9 Trailer",
      vidId: "cf13d553ca6aefda1ecefb343b30bd04b860e21a0554ae51aaf0a41c65b666f4",
    };
  },
  components: {
    MediaPlayer,
    //Metadata,
    AnnotationList,
    ShotBoundaryAnnotations,
    //FaceAnalysisGraph,
    DataViewer,
    TimelineComponent,
    VideoList,
  },
  methods: {
    openTab: function (event) {
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
    checkVideoDetectShotsDone: function (jobId, fps) {
      console.log("repeating checkVideoDetectShotsDone");
      axios
        .get(this.baseUrl1 + "detect_shots", {
          params: { job_id: jobId, fps: fps },
        })
        .then((responceShots) => {
          if (responceShots) {
            if (responceShots.data.status == "SUCCESS") {
              console.log("clearing checkVideoDetectShotsDone");
              //clearInterval(this.jobsInProcess[jobId]["intervalHandler"]);
              this.vid1ShotData = responceShots.data.shots;
              this.$root.$refs.ShotBoundaryView.curVidShotData =
                this.vid1ShotData;
              this.$root.$refs.DataViewer.curVidShotData = this.vid1ShotData;
              if (this.firstTime) {
                this.saveVideoTimelineSegments(this.vid1ShotData);
              }
            } else {
              setTimeout(
                this.checkVideoDetectShotsDone(jobId, fps),
                AppConfig.jobRecallTime
              );
            }
          }
        });
    },
    saveVideoTimelineSegments: function (shots) {
      var payload = {
        obj: {
          shots: shots,
          timeline_id: "17476c5c-e15f-4a04-9ecd-fe2051454df8",
        },
      };
      axios
        .post(
          this.$root.$refs.DataViewer.dbServerLink + "saveTimelineSegments",
          payload
        )
        .then((res) => {
          console.log("on: getVideoMetaData: ");
          console.log(res);
          if (res.data["status"] == 200) {
                 this.$notifikation.success({
                  message: 'VideoTimelineSegments saved.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
            this.firstTime = false;
          } else {
                this.$notifikation.error({
                  message: 'VideoTimelineSegments not saved.',
                  duration: 8000,
                  style : { 
                    width: 100, top: 30, 
                  },
                });
          }
        });
    },
    getVideoMetaData: function (vidPath, vidFileTitle) {
      axios
        .get(this.baseUrl1 + "read_meta", {
          params: { title: vidFileTitle, path: vidPath },
        })
        .then((res) => {
          if (res) {
            var responce = eval("(function(){return " + res.data + ";})()");
            this.$root.$refs.AnalysisViewerView.vid1Metadata =
              responce.metadata;
            //this.$root.$refs.MetadataView.curMetadata = responce.metadata;
            this.$root.$refs.AnalysisViewerView.vidId = responce.video_id;
            axios
              .post(this.baseUrl1 + "detect_shots", {
                video_id: responce.video_id,
                path: vidPath,
              })
              .then((responceShots) => {
                if (responceShots) {
                  console.log("setting checkVideoDetectShotsDone");
                  /* var intervalHandler = setInterval(
                    this.checkVideoDetectShotsDone(
                      responceShots.data.job_id,
                      responce.metadata.fps
                    ),
                    AppConfig.jobRecallTime
                  );
                  this.jobsInProcess[responceShots.data.job_id] = {
                    type: "detect_shots",
                    intervalHandler: intervalHandler,
                  }; */
                  setTimeout(
                    this.checkVideoDetectShotsDone(
                      responceShots.data.job_id,
                      responce.metadata.fps
                    ),
                    AppConfig.jobRecallTime
                  );
                  axios
                    .post(
                      this.$root.$refs.DataViewer.dbServerLink +
                        "updateMetadata",
                      {
                        metadata: responce.metadata,
                        jobId: responceShots.data.job_id,
                        videoId: responce.video_id,
                        videoFileName: vidFileTitle,
                      }
                    )
                    .then((responceUpdateMetadata) => {
                      if (responceUpdateMetadata) {
                        console.log(
                          "setting responceUpdateMetadata",
                          responceUpdateMetadata
                        );
                      }
                    });
                }
              });
          }
        });
    },
  },
  beforeMount() {
    //this.$root.$refs.AnalysisViewerView.vidPath = "media/Crash_Course_Engineering_Preview_-_English.mp4";
    //this.$root.$refs.AnalysisViewerView.vidFileTitle = "Crash_Course_Engineering_Preview_-_English";
    var vidPath = this.$root.$refs.AnalysisViewerView.vidPath;
    var vidFileTitle = this.$root.$refs.AnalysisViewerView.vidFileTitle;
    this.getVideoMetaData(vidPath, vidFileTitle);
    

  },
};
</script>


<style>
@import "./AnalysisViewer.css";
</style>
