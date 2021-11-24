<template>
  <div>
    <div class="text-color annotation-list-font div-table-annotation">
      <table width="100%" class="table-annotation">
        <tr>
          <th width="25%" class="table-th-annotation">Start</th>
          <th width="25%" class="table-th-annotation">Middle</th>
          <th width="25%" class="table-th-annotation">End</th>
          <th width="25%" class="table-th-annotation">Detail</th>
        </tr>
        <tr
          v-for="shot in vidShotData"
          class="table-td-annotation"
          :key="shot.shot_id"
          :id="'shot_anno_list_' + shot.shot_id"
        >
          <td width="25%">
            <img
              :id="'shot_' + shot.shot_id + '_frame_0'"
              class="img-shot-frame"
              src="./../assets/ph_shot_start.png"
              alt="starting"
            />
          </td>
          <td width="25%">
            <img
              :id="'shot_' + shot.shot_id + '_frame_1'"
              class="img-shot-frame"
              src="./../assets/ph_shot_middle.png"
              alt="middle"
            />
          </td>
          <td width="25%">
            <img
              :id="'shot_' + shot.shot_id + '_frame_2'"
              class="img-shot-frame"
              src="./../assets/ph_shot_end.png"
              alt="ending"
            />
          </td>
          <td width="25%">
            <div class="text-align-left text-align-top">
              Shot Id: {{ shot.shot_id }}<br />
              Time: {{ shot.start_time.slice(3, 8) }} -
              {{ shot.end_time.slice(3, 8) }}<br />
              Duration: {{ (shot.end_frame - shot.start_frame) / 25 }} sec<br />
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import AppConfig from "./../../AppConfig.json";
//import faceDataTp from './../assets/faceData.json'
//import faceClusterTp from './../assets/faceCluster.json'
export default {
  name: "AnnotationListView",
  annotationType: "shotDetection",
  props: ["type", "vidShotData", "vidFaceData"],
  //facedata:[],
  //shotdata:[],
  created: function () {
    this.$root.$refs.AnnotationListView = this;
  },
  mounted() {},
  data() {
    return {
      dbServerLink: AppConfig.dbServerLink,
      metadata: {
        title: "Title of teh video",
        duration: 120,
        fps: 25,
        shotSeqIdx: 4,
        shotStartFrameIdx: 1,
        shotEndFrameIdx: 2,
        shotStartTimeIdx: 5,
        shotEndTimeIdx: 6,
        source_size: [1080, 720],
        faceCounter: 1,
      },
      occuranceColorTheme: "",
      defaultOccuranceFilterValues: 5,
      occuranceFilterValues: [10, 15, 20, 25, 30, 35, 40],
      videoId:
        "cf13d553ca6aefda1ecefb343b30bd04b860e21a0554ae51aaf0a41c65b666f4",
      videoPath: AppConfig.videoPath + "f9_scene1.mp4",
      shotFrames: [],
      faceFrames: [],
      vidFileTitle: "f9_scene1",
      vidName: "Fast & Furious 9 Trailer",
      vidId: "4db96bb8-1fe0-45c1-abb3-169991af047a",
      vidHash: "4db96bb8-1fe0-45c1-abb3-169991af047a",
    };
  },
  methods: {
    loadVideoAnalysis: function () {
      this.vidFileTitle = sessionStorage.getItem("videoFileName");
      this.vidName = sessionStorage.getItem("videoTitle");
      this.vidId = sessionStorage.getItem("videoId");
      this.vidHash = sessionStorage.getItem("videoHash");
      this.vidPath = AppConfig.videoPath + this.vidFileTitle;
    },
    onPlayTimeChange: function () {},
    onChangeOccuranceFilter: function (event) {
      console.log("inside onChangeOccuranceFilter: ");
      console.log(event.target);
      this.defaultOccuranceFilterValues = parseInt(
        document.getElementById("faceOccuranceFilter").value
      );
    },
    onCbShotBoundaryFreyLineChange: function (event) {
      console.log("inside onCbShotBoundaryFreyLineChange: ");
      console.log(event.target);
    },
    onShotSearch: function (event) {
      console.log("inside onShotSearch: ");
      console.log(event.target);
    },
    onCbFaceDetectorChange: function (event) {
      console.log("inside onCbFaceDetectorChange: ");
      console.log(event.target);
    },
    sleepFor: function (sleepDuration) {
      var now = new Date().getTime();
      while (new Date().getTime() < now + sleepDuration) {
        /* Do nothing */
      }
    },
    checkGettingShotFramesDone: function () {
      console.log("repeating checkGettingShotFramesDone");
      var payload = { obj: { video_id: this.vidId } };
      debugger;
      axios
        .post(this.dbServerLink + "getShotThumbnailsByVideoId", payload)
        .then((response) => {
          debugger;
          if (response.data["status"] == 200) {
            var thumbnails = response.data["result"];
            var frmInnerCnt = {};
            var shotIdx = 4;
            var frameIdx = 5;
            var imageIdx = 1;
            for (var i = 0; i < thumbnails.length; i++) {
              if (thumbnails[i][shotIdx] in frmInnerCnt) {
                frmInnerCnt[thumbnails[i][shotIdx]] += 1;
              } else {
                frmInnerCnt[thumbnails[i][shotIdx]] = 0;
              }
              if (
                document.getElementById(
                  "shot_" +
                    thumbnails[i][shotIdx] +
                    "_frame_" +
                    frmInnerCnt[thumbnails[i][shotIdx]]
                )
              ) {
                document.getElementById(
                  "shot_" +
                    thumbnails[i][shotIdx] +
                    "_frame_" +
                    frmInnerCnt[thumbnails[i][shotIdx]]
                ).src = "data:image/jpg;base64," + thumbnails[i][imageIdx];
              }
            }
          }
        });
    },
    updateShotsList: function () {
      var thumbnail_frames = Array();
      //this.vidShotData = this.$root.$refs.DataViewer.curVidShotData;
      //this.vidShotData = this.$root.$refs.AnalysisViewerView.curVidShotData;
      for (var i = 0; i < this.vidShotData.length; i++) {
        var frames = [
          this.vidShotData[i]["start_frame"],
          parseInt(
            this.vidShotData[i]["start_frame"] +
              (this.vidShotData[i]["end_frame"] -
                this.vidShotData[i]["start_frame"]) /
                2
          ),
          this.vidShotData[i]["end_frame"],
        ];
        for (var j = 0; j < frames.length; j++) {
          thumbnail_frames.push({
            id: this.vidShotData[i]["shot_id"],
            idx: frames[j],
            bbox_xywh: null,
          });
        }
      }
      var video_id = this.vidId;
    },
  },
  //mounted: function () {
  //this.updateShotsList();
  //this.checkGettingShotFramesDone();
  //},
  updated: function () {
    this.checkGettingShotFramesDone();
  },
  beforeMount: function () {
    this.loadVideoAnalysis();
  },
};
</script>


<style>
.annotation-list-font {
  font-size: 12px !important;
}
.annotation-list-pad-margin {
  padding: 0px;
  margin: opx;
}
.text-align-top {
  vertical-align: top;
}
</style>
