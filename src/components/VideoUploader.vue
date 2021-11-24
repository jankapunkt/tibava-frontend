<template>
  <div>
    <div class="container text-align-left">
      <!--             <div class="row">
                <div class="col-sm-10">
                    <button class="btn btn-primary" id="videoFilebtn"  @click="onFileUpload2($event)">Upload</button>
                    </div>
                </div>
            <br/>-->
      <br /><br />

      <div id="modalDiv" class="modal">
        <div class="modal-content">
          <div class="row">
            <div class="col-sm-6">
              <h4>Upload New Video</h4>
            </div>
            <div class="col-sm-6">
              <div class="text-right">
                <button
                  class="btn btn-primary tib-theme-red"
                  v-on:click="onFormCancel"
                >
                  X
                </button>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <div id="upload_form_2">
                <div class="form-group row">
                  <label for="title" class="col-sm-2 col-form-label"
                    >Title</label
                  >
                  <div class="col-sm-10">
                    <input
                      class="form-control"
                      id="title"
                      placeholder="Title Of The Video"
                    />
                  </div>
                </div>
                <div class="form-group row">
                  <label for="ownerName" class="col-sm-2 col-form-label"
                    >User</label
                  >
                  <div class="col-sm-10">
                    <input
                      class="form-control"
                      id="ownerName"
                      placeholder="Your User Name"
                    />
                  </div>
                </div>
                <div class="form-group row">
                  <label for="licence" class="col-sm-2 col-form-label"
                    >License</label
                  >
                  <div class="col-sm-10">
                    <select class="custom-select" id="licence" required>
                      <option value>Select Licence</option>
                      <option value="CC-BY-2.0">CC-BY-2.0</option>
                      <option value="CC-SA">CC-SA</option>
                      <option value="CC-NC">CC-NC</option>
                    </select>
                  </div>
                  <div class="invalid-feedback">This value is not valid</div>
                </div>
                <div class="form-group row">
                  <label for="identifier" class="col-sm-2 col-form-label"
                    >Identifier</label
                  >
                  <div class="col-sm-10">
                    <input
                      class="form-control"
                      id="identifier"
                      placeholder="Identifiers DOI or URL"
                    />
                  </div>
                </div>

                <div class="form-group row">
                  <div class="col-sm-2">Analysis</div>
                  <div class="col-sm-10">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="cbShotBoundary"
                      />
                      <label class="form-check-label" for="shotBoundary">
                        Shot boundary
                      </label>
                    </div>
                  </div>
                </div>

                <form
                  id="upload_form"
                  class="file-upload-form"
                  enctype="multipart/form-data"
                >
                  <div class="col-sm-12">
                    <input
                      type="file"
                      name="file1"
                      id="file1"
                      @change="uploadFile"
                    />
                    <br />
                    <progress
                      id="progressBar"
                      value="0"
                      max="100"
                      style="width: 100%; color: #af1414"
                    ></progress>
                    <h3 id="status"></h3>
                    <p id="loaded_n_total"></p>
                  </div>
                </form>
                <div class="form-group row">
                  <div class="col-sm-6">
                    <button
                      class="btn btn-primary tib-theme-red"
                      v-on:click="onFormSubmit"
                    >
                      Submit
                    </button>
                  </div>
                  <div class="col-sm-6">
                    <div class="text-right">
                      <button
                        class="btn btn-primary tib-theme-red"
                        v-on:click="onFormCancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <br />

      <br />
      <br />
      <div class="row">
        <div class="col-sm-6 text-align-left">
          <h4>Video Analysis Queue</h4>
        </div>
        <div class="col-sm-6 text-align-right">
          <button
            class="col-sm-4 tib-theme-red btn btn-info"
            @click="showModal"
            style="width: 100%"
          >
            Upload New Video
          </button>
        </div>
      </div>
      <div class="row">
        <table width="100%" class="text-color">
          <tbody>
            <tr class="border-down">
              <th class="text-align-left">Title</th>
              <th class="text-align-left">User</th>
              <th class="text-align-left">Licence</th>
              <th class="text-align-left col-wrap-text">Identifier</th>
              <th class="text-align-left">Process</th>
              <th class="text-align-left">Actions</th>
            </tr>
            <tr
              v-for="vid in videos"
              :key="vid[0]"
              class="border-down"
              height="40px"
            >
              <th class="text-align-left">{{ vid[1] }}</th>
              <th class="text-align-left">{{ vid[3] }}</th>
              <th class="text-align-left">{{ vid[5] }}</th>
              <th class="text-align-left col-wrap-text">{{ vid[6] }}</th>
              <th class="text-align-left" id="status_icon">
                <div v-for="process in processListIdx" :key="process">
                  {{ processList[processListIdx.indexOf(process)] }} |
                  <i
                    :id="'statusIcon_' + vid[0]"
                    class="fa fa-spinner fa-pulse theme-red"
                  ></i>
                </div>
              </th>
              <th class="text-align-left">
                <a href="#" v-on:click="processVideo(vid[0], vid[10])"
                  >Submit or Check Job</a
                >
                |
                <a
                  href="#"
                  v-on:click="loadVideo(vid[0], vid[9], vid[10], vid[1])"
                  >Load Analysis</a
                >
                |
                <a href="#" v-on:click="deleteVideo(vid[0])"
                  ><i class="fa fa-trash fa-lg theme-red"></i
                ></a>
              </th>
              <!--  <th class="text-align-left" v-on:click="deleteVideo(vid[0])">
                <i class="fa fa-trash fa-lg red"></i>
              </th> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import AppConfig from "./../../AppConfig.json";

export default {
  name: "VideoUploaderView",
  data: function () {
    return {
      myFiles: "empty",
      processCheckTime: 7500,
      notifikationDuration: 8000,
      notifikationWidth: 200,
      notifikationTop: 30,
      shotIdIdx: 0,
      shotStartFrameIdx: 1,
      shotEndFrameIdx: 2,
      shotStartTimeIdx: 5,
      shotEndTimeIdx: 6,
      dbServerLink: AppConfig.dbServerLink,
      backendServerLink: AppConfig.backendServerLink,
      videoPath: AppConfig.videoPath,
      processList: ["Shot Detection"],
      processListIdx: ["detect_shots"], //this need to be kept same as backend calls, list will grow as backend analysis frow
      videos: [
        [
          "769c0625-7438-4c13-8517-848ca7a7c989",
          "f9 movie scene",
          "Education-101",
          "JAG",
          "junaidghauri205@gmail.com",
          "1",
          "Education-101-1",
          "Wed, 21 Jul 2021 08:08:38 GMT",
          ".\\videos",
          null,
          "f9_scene1.mp4",
        ],
      ],
    };
  },
  methods: {
    showModal() {
      var modal = document.getElementById("modalDiv");
      modal.style.display = "block";
    },
    handleFilePondInit: function () {
      console.log("FilePond has initialized");
    },
    getRandomWaitingTime: function () {
      return (
        this.processCheckTime +
        Math.floor(Math.random() * this.processCheckTime)
      );
    },
    processVideo: function (id, fileName) {
      console.log("in processVideo id: " + id);
      console.log("in processVideo file name: " + fileName);
      var vidPath = AppConfig.videoPath;
      var vidFileTitle = fileName;
      var vidDbId = id;
      this.getVideoMetaData(vidPath, vidFileTitle, vidDbId);
    },
    loadVideo: function (videoId, videoHash, videoFileName, videoTitle) {
      console.log("in loadVideo" + videoId);
      sessionStorage.setItem("videoId", videoId);
      sessionStorage.setItem("videoHash", videoHash);
      sessionStorage.setItem("videoFileName", videoFileName);
      sessionStorage.setItem("videoTitle", videoTitle);
      this.$router.push({ name: "Analysis" });
      /* this.$root.$refs.AnalysisViewerView.loadVideoAnalysis(
        videoId,
        videoHash,
        videoFileName,
        videoTitle
      ); */
    },
    deleteVideo: function (id) {
      console.log("in deleteVideo" + id);
      var payload = { id: id };
      var rep = confirm("Are you sure to delete this video?");
      if (rep) {
        axios.post(this.dbServerLink + "deleteVideo", payload).then((res) => {
          console.log("on: deleteVideo: ");
          console.log(res);
          if (res.data["status"] == 200) {
            console.log("deleteVideo Successfully :)");
            this.getAllVideos();
            this.$notifikation.success({
              message: "deleteVideo Successfully :)",
              duration: this.notifikationDuration,
              style: {
                width: this.notifikationWidth,
                top: this.notifikationTop,
              },
            });
          } else {
            console.log("Not deleteVideo Successfull :(");
          }
        });
      }
    },
    getAllVideos: function () {
      axios.post(this.dbServerLink + "getAllVideoRecord").then((res) => {
        console.log("on: getAllVideoRecord: ");
        console.log(res);
        if (res.data["status"] == 200) {
          this.videos = res.data.result;
        } else {
          console.log("Error getAllVideos :(");
        }
      });
    },
    getVideoMetaData: function (vidPath, vidFileTitle, vidDbId) {
      axios
        .get(this.backendServerLink + "read_meta", {
          params: {
            title: vidFileTitle.replace(".mp4", ""),
            path: vidPath + vidFileTitle,
          },
        })
        .then((res) => {
          if (res) {
            var responce = eval("(function(){return " + res.data + ";})()");
            var vidMetadata = responce.metadata;
            var vidhash = responce.video_id;
            axios
              .post(this.backendServerLink + "detect_shots", {
                video_id: vidhash,
                path: vidPath + vidFileTitle,
              })
              .then((responceShots) => {
                if (responceShots) {
                  this.setcheckVideoDetectShots(
                    responceShots.data.job_id,
                    vidMetadata.fps,
                    vidhash,
                    vidDbId,
                    vidPath,
                    vidFileTitle
                  );
                  axios
                    .post(this.dbServerLink + "updateMetadata", {
                      metadata: responce.metadata,
                      jobId: responceShots.data.job_id,
                      videoId: responce.video_id,
                      videoFileName: vidFileTitle,
                    })
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
    checkVideoDetectShotsDone: function (
      jobId,
      fps,
      vidhash,
      vidDbId,
      vidPath,
      vidFileTitle
    ) {
      console.log("repeating checkVideoDetectShotsDone");
      axios
        .get(this.backendServerLink + "detect_shots", {
          params: { job_id: jobId, fps: fps },
        })
        .then((responceShots) => {
          if (responceShots) {
            if (responceShots.data.status == "SUCCESS") {
              console.log("clearing checkVideoDetectShotsDone"); // here once success we donot set timer again later
              var vidShotData = responceShots.data.shots;
              this.saveVideoTimelineSegments(
                vidShotData,
                vidhash,
                vidDbId,
                vidPath,
                vidFileTitle
              );
              this.saveShotsFrameList(
                vidShotData,
                vidhash,
                vidDbId,
                vidPath,
                vidFileTitle
              );
            } else {
              /* if (responceShots.data.status !== "ERROR") {
                this.setcheckVideoDetectShots(jobId, fps, vidhash, vidDbId,vidPath, vidFileTitle);
              } */
            }
          }
        });
    },
    saveVideoTimelineSegments: function (
      shots,
      vidhash,
      vidDbId,
      vidPath,
      vidFileTitle
    ) {
      var payload = { obj: { video_id: vidDbId } };
      axios
        .post(this.dbServerLink + "getAllTimelinesByVideoId", payload)
        .then((res) => {
          if (res.data["status"] == 200) {
            if (res.data.result.length == 0) {
              // here we need to put check if timeline already exist
              var payload2 = {
                obj: {
                  shots: shots,
                  videohash: vidhash,
                  videoId: vidDbId,
                  timelineCategory: "Shots",
                },
              };
              axios
                .post(this.dbServerLink + "saveTimelineSegments", payload2)
                .then((res) => {
                  console.log("on: getVideoMetaData: ");
                  console.log(res);
                  if (res.data["status"] == 200) {
                    //alert("saveVideoTimelineSegments Successfully :)");
                    this.$notifikation.success({
                      message: "saveVideoTimelineSegments Successfully :)",
                      duration: this.notifikationDuration,
                      style: {
                        width: this.notifikationWidth,
                        top: this.notifikationTop,
                      },
                    });
                    var element = document.getElementById(
                      "statusIcon_" + vidDbId
                    );
                    element.className =
                      element.className
                        .replace("fa-spinner", "")
                        .replace("fa-pulse", "") + " fa-check-circle";
                    this.saveShotsFrameList(
                      shots,
                      vidhash,
                      videoId,
                      vidPath,
                      vidFileTitle
                    );
                  } else {
                    //alert("saveVideoTimelineSegments Not Successfully :(");
                    this.$notifikation.error({
                      message: "saveVideoTimelineSegments Not Successfully :(",
                      duration: this.notifikationDuration,
                      style: {
                        width: this.notifikationWidth,
                        top: this.notifikationTop,
                      },
                    });
                  }
                });
            } else {
              var element = document.getElementById("statusIcon_" + vidDbId);
              element.className =
                element.className
                  .replace("fa-spinner", "")
                  .replace("fa-pulse", "") + " fa-check-circle";
            }
          }
        });
    },
    saveShotsFrameList: function (
      shots,
      vidhash,
      videoId,
      vidPath,
      vidFileTitle
    ) {
      var thumbnail_frames = Array();
      for (var i = 0; i < shots.length; i++) {
        var frames = [
          shots[i]["start_frame"],
          parseInt(
            shots[i]["start_frame"] +
              (shots[i]["end_frame"] - shots[i]["start_frame"]) / 2
          ),
          shots[i]["end_frame"],
        ];
        for (var j = 0; j < frames.length; j++) {
          thumbnail_frames.push({
            id: shots[i]["shot_id"],
            idx: frames[j],
            bbox_xywh: null,
          });
        }
      }
      var vidPathWFile = vidPath + vidFileTitle;
      axios
        .post(this.backendServerLink + "get_thumbnails", {
          video_id: videoId,
          path: vidPathWFile,
          frames: thumbnail_frames,
        })
        .then((responce) => {
          if (responce) {
            setTimeout(
              this.checkGettingShotFramesDone(
                responce.data.job_id,
                vidhash,
                videoId,
                vidPath,
                vidFileTitle
              ),
              this.getRandomWaitingTime()
            );
          }
        });
    },
    checkGettingShotFramesDone: function (
      jobId,
      vidhash,
      videoId,
      vidPath,
      vidFileTitle
    ) {
      axios
        .get(this.backendServerLink + "get_thumbnails", {
          params: { job_id: jobId },
        })
        .then((response) => {
          debugger;
          if (response) {
            debugger;
            if (response.data.status == "SUCCESS") {
              var shotFramesRefined = [];
              var frmInnerCnt = {};
              for (var i = 0; i < response.data.thumbnails.length; i++) {
                if (response.data.thumbnails[i].id in frmInnerCnt) {
                  frmInnerCnt[response.data.thumbnails[i].id] += 1;
                } else {
                  frmInnerCnt[response.data.thumbnails[i].id] = 0;
                }
                shotFramesRefined.push([
                  response.data.thumbnails[i].id,
                  frmInnerCnt[response.data.thumbnails[i].id],
                  response.data.thumbnails[i].img,
                ]);
              }
              this.saveShotThumbnailsDB(videoId, vidhash, shotFramesRefined);
            } else if (response.data.status == "PENDING") {
              setTimeout(
                this.checkGettingShotFramesDone(
                  jobId,
                  vidhash,
                  videoId,
                  vidPath,
                  vidFileTitle
                ),
                this.getRandomWaitingTime()
              );
            }
          }
        });
    },
    saveShotThumbnailsDB: function (videoId, vidhash, shotFramesRefined) {
      axios
        .post(this.dbServerLink + "getShotThumbnailsByVideoId", {
          obj: { video_id: videoId },
        })
        .then((response) => {
          debugger;
          if (
            response.data["status"] == 200 &&
            response.data["result"].length == 0
          ) {
            var payload = {
              obj: {
                video_id: videoId,
                video_hash: vidhash,
                shot_frames_refined: shotFramesRefined,
              },
            };
            axios
              .post(this.dbServerLink + "saveShotThumbnailsByVideoId", payload)
              .then((response) => {
                debugger;
                if (response.data["status"] == 200) {
                  this.$notifikation.success({
                    message: "ThumbnailsByVideo saved successfully.",
                    duration: this.notifikationDuration,
                    style: {
                      width: this.notifikationWidth,
                      top: this.notifikationTop,
                    },
                  });
                }
              });
          }
        });
    },
    setcheckVideoDetectShots: function (
      jobId,
      fps,
      vidhash,
      vidDbId,
      vidPath,
      vidFileTitle
    ) {
      var mSeconds = this.getRandomWaitingTime();
      setTimeout(
        this.checkVideoDetectShotsDone(
          jobId,
          fps,
          vidhash,
          vidDbId,
          vidPath,
          vidFileTitle
        ),
        mSeconds
      );
      console.log("checkVideoDetectShotsDone in uploader: ", mSeconds);
    },
    onFormCancel: function () {
      var modal = document.getElementById("modalDiv");
      modal.style.display = "none";
    },
    onFormSubmit: function () {
      var allInputs = document
        .getElementById("upload_form_2")
        .getElementsByTagName("input");
      console.log("in submitted: ", allInputs);
      var allInputsArr = {};
      for (var i = 0; i < allInputs.length; i++) {
        if (allInputs[i].type === "checkbox") {
          allInputsArr[allInputs[i].id] = allInputs[i].checked;
        } else {
          allInputsArr[allInputs[i].id] = allInputs[i].value;
        }
      }
      var file = document.getElementById("file1").files[0];
      if (file) {
        allInputsArr["video_file_name"] = file.name;
      } else {
        this.$notifikation.info({
          message: "No video file selected.",
          duration: this.notifikationDuration,
          style: {
            width: this.notifikationWidth,
            top: this.notifikationTop,
          },
        });
      }
      allInputsArr["licence"] = document.getElementById("licence").value;
      let payload = { user_id: "junaid", videoFormalMetadata: allInputsArr };
      console.log("Now link is saveVideoRecord");
      console.log(this.dbServerLink + "saveVideoRecord");
      axios.post(this.dbServerLink + "saveVideoRecord", payload).then((res) => {
        console.log("on: saveVideoRecord: ");
        console.log(res);
        if (res.data["status"] == 200) {
          this.onFormCancel();
          this.$notifikation.success({
            message: "Video saved successfully.",
            duration: this.notifikationDuration,
            style: {
              width: this.notifikationWidth,
              top: this.notifikationTop,
            },
          });
          this.getAllVideos();
        } else {
          this.$notifikation.error({
            message: "Video not saved successfully.",
            duration: 8000,
            style: {
              width: 100,
              top: 30,
            },
          });
        }
      });
    },
    onFileUpload: function ($event) {
      console.log("in onFileUpload");
      console.log($event);
      console.log("loaded");
      console.log($event.loaded);
      console.log("total");
      console.log($event.total);
    },
    onFileUpload2: function ($event) {
      console.log("in onFileUpload");
      console.log($event);
      axios
        .post(this.dbServerLink + "saveVideo", {
          job_id: "",
          files: document.getElementById("videoFile").files,
        })
        .then((res) => {
          console.log("results: onFileUpload: ");
          console.log(res);
        });
    },
    progressHandler: function (event) {
      document.getElementById("loaded_n_total").innerHTML =
        "Uploaded " + event.loaded + " bytes of " + event.total;
      var percent = (event.loaded / event.total) * 100;
      document.getElementById("progressBar").value = Math.round(percent);
      document.getElementById("status").innerHTML =
        Math.round(percent) + "% uploaded... please wait";
    },
    completeHandler: function (event) {
      var response = JSON.parse(event.target.response);
      console.log("respionse is : ", response);
      if (response["status"] === 200) {
        document.getElementById("status").innerHTML =
          "<h5 class='text-color-green'>Upload Successfully</h5>";
        document.getElementById("progressBar").value = 100;
      } else {
        document.getElementById("status").innerHTML =
          "<h5 class='text-color-red'>Upload Failed</h5>";
        document.getElementById("progressBar").value = 0;
      }
    },
    errorHandler: function () {
      document.getElementById("status").innerHTML = "Upload Failed";
      this.$notifikation.error({
        message: "Upload failed.",
        duration: this.notifikationDuration,
        style: {
          width: this.notifikationWidth,
          top: this.notifikationTop,
        },
      });
    },
    abortHandler: function () {
      document.getElementById("status").innerHTML = "Upload Aborted";
    },
    uploadFile: function () {
      var file = document.getElementById("file1").files[0];
      var formdata = new FormData();
      formdata.append("file1", file);
      var ajax = new XMLHttpRequest();
      ajax.upload.addEventListener("progress", this.progressHandler, false);
      ajax.addEventListener("load", this.completeHandler, false);
      ajax.addEventListener("error", this.errorHandler, false);
      ajax.addEventListener("abort", this.abortHandler, false);
      ajax.open("POST", this.dbServerLink + "saveVideo");
      //ajax.open("POST", "http://ava21.service.tib.eu/" + "saveVideo");
      ajax.send(formdata);
    },
  },
  mounted: function () {
    this.getAllVideos();
  },
};
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";

.file-upload-form {
  margin-top: 25px;
}
.col-wrap-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 150px;
}
.col-wrap-text:hover {
  background-color: #bde5f8;
  overflow: visible;
  white-space: normal;
  height: auto;
  max-width: 100%;
}
.theme-red {
  color: #af1414;
}
</style>
