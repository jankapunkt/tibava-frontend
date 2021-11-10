<template>
  <div>
    <div class="container text-align-left">
      <!--             <div class="row">
                <div class="col-sm-10">
                    <button class="btn btn-primary" id="videoFilebtn"  @click="onFileUpload2($event)">Upload</button>
                    </div>
                </div>
            <br/> -->
      <div class="row">
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
              accept="video/*"
            /><br />
            <progress
              id="progressBar"
              value="0"
              max="100"
              style="width: 1100px; color: #af1414"
            ></progress>
            <h3 id="status"></h3>
            <p id="loaded_n_total"></p>
          </div>
        </form>
      </div>
      <br />
      <div class="row">
        <h4>Formal Metadata</h4>
        <!-- <div class="col-sm-6">
                    <FilePond
                    name="test"
                    ref="pond"
                    labelIdle="Drop files here..."
                    allowMultiple="true"
                    acceptedFileTypes="image/jpeg, image/png"
                    v-bind:files="myFiles"
                    v-on:init="handleFilePondInit"/>
                </div> -->
        <div class="col-sm-12">
          <div id="upload_form_2">
            <div class="form-group row">
              <label for="title" class="col-sm-2 col-form-label">Title</label>
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="title"
                  placeholder="Title of the video"
                />
              </div>
            </div>
            <div class="form-group row">
              <label for="titleSeries" class="col-sm-2 col-form-label"
                >Title of Series</label
              >
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="titleSeries"
                  placeholder="Title of the Video Series (Optional)"
                />
              </div>
            </div>
            <div class="form-group row">
              <label for="authorName" class="col-sm-2 col-form-label"
                >Video's Owner</label
              >
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="authorName"
                  placeholder="Video's Owner Name (If different than logged in user)"
                />
              </div>
            </div>
            <div class="form-group row">
              <label for="authorEmail" class="col-sm-2 col-form-label"
                >Video's Owner Email</label
              >
              <div class="col-sm-10">
                <input
                  type="email"
                  class="form-control"
                  id="authorEmail"
                  placeholder="Video's Owner Email (If different than logged in user email)"
                />
              </div>
            </div>
            <div class="form-group row">
              <label for="licence" class="col-sm-2 col-form-label"
                >Licence</label
              >
              <div class="col-sm-10">
                <select class="custom-select" id="licence" required>
                  <option value="">Select Licence</option>
                  <option value="CC-BY-2.0">CC-BY-2.0</option>
                  <option value="CC-SA">CC-SA</option>
                  <option value="CC-NC">CC-NC</option>
                </select>
              </div>
              <div class="invalid-feedback">This value is not valid</div>
            </div>
            <div class="form-group row">
              <label for="identifier" class="col-sm-2 col-form-label"
                >Identifiers</label
              >
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="identifier"
                  placeholder="Identifiers DOI or URL"
                />
              </div>
            </div>
            <!--                         <div class="form-group row">
                            <label for="releaseDate" class="col-sm-2 col-form-label">Release Date</label>
                            <div class="col-sm-10">
                            <input type="date" class="form-control" id="releaseDate" placeholder="Release Date">
                            </div>
                        </div> -->
            <!--                         <div class="form-group row">
                            <div class="col-sm-2">Select Analysis</div>
                            <div class="col-sm-10">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="cbShotBoundary">
                                <label class="form-check-label" for="shotBoundary">
                                    Shot boundary
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="cbRGBGraph">
                                <label class="form-check-label" for="RGBGraph">
                                    RGB Graph
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="cbFaceAreaAndLocalize">
                                <label class="form-check-label" for="faceAreaAndLocalize">
                                    Face Area and Localize
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="cbKeyFrames">
                                <label class="form-check-label" for="keyFrames">
                                    Key Frames
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="cbObjectDetection">
                                <label class="form-check-label" for="objectDetection">
                                    Object Detection
                                </label>
                            </div>
                            </div>
                        </div> -->
            <div class="form-group row">
              <div class="col-sm-10">
                <button class="btn btn-primary" v-on:click="onFormSubmit">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <br />
      <br />
      <div class="row">
        <h4>Video Analysis Queue</h4>
        <table width="100%" class="text-color">
          <tbody>
            <tr class="border-down">
              <th class="text-align-left">Title</th>
              <th class="text-align-left">Series</th>
              <th class="text-align-left">Owner</th>
              <th class="text-align-left">File Name</th>
              <th class="text-align-left">Status</th>
              <th class="text-align-left">Process</th>
              <th class="text-align-left">Remove</th>
            </tr>
            <tr
              v-for="vid in videos"
              :key="vid[0]"
              class="border-down"
              height="40px"
            >
              <th class="text-align-left">{{ vid[1] }}</th>
              <th class="text-align-left">{{ vid[2] }}</th>
              <th class="text-align-left">{{ vid[3] }}</th>
              <th class="text-align-left">{{ vid[10] }}</th>
              <th class="text-align-left" id="status_icon">
                <i class="fa fa-spinner fa-pulse fa-lg"></i>
              </th>
              <th class="text-align-left">
                <a href="#" v-on:click="processVideo(vid[0], vid[10])"
                  >Process</a
                >
                | <a href="#" v-on:click="loadVideo(vid[0])">Load</a>
              </th>
              <th class="text-align-left" v-on:click="deleteVideo(vid[0])">
                <i class="fa fa-trash fa-lg red"></i>
              </th>
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
      dbServerLink: AppConfig.dbServerLink,
      videos: [],
    };
  },
  methods: {
    handleFilePondInit: function () {
      console.log("FilePond has initialized");
    },
    processVideo: function (id, fileName) {
      console.log("in processVideo id: " + id);
      console.log("in processVideo file name: " + fileName);
      //window.location.href
      //document.getElementById("media_player").src = window.location.href+"media/f9_scene1.9287840e.mp4";
      console.log(
        "in processVideo this.$root.$refs.MediaPlayerView.$refs: " +
          this.$root.$refs.MediaPlayerView.$refs
      );
    },
    loadVideo: function (id) {
      console.log("in loadVideo" + id);
    },
    deleteVideo: function (id) {
      console.log("in deleteVideo" + id);
      var payload = { id: id };
      axios.post(this.dbServerLink + "deleteVideo", payload).then((res) => {
        console.log("on: deleteVideo: ");
        console.log(res);
        if (res.data["status"] == 200) {
          console.log("deleteVideo Successfully :)");
          this.getAllVideos();
        } else {
          console.log("Not deleteVideo Successfull :(");
        }
      });
    },
    getAllVideos: function () {
      axios.post(this.dbServerLink + "getAllVideoRecord").then((res) => {
        console.log("on: getAllVideoRecord: ");
        console.log(res);
        if (res.data["status"] == 200) {
          console.log("saved Successfully :)");
          this.videos = res.data.result;
        } else {
          console.log("Not Successfull :(");
        }
      });
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
        alert("video file not selected!!!");
      }
      allInputsArr["licence"] = document.getElementById("licence").value;
      let payload = { user_id: "junaid", videoFormalMetadata: allInputsArr };
      console.log("Now link is saveVideoRecord");
      console.log(this.dbServerLink + "saveVideoRecord");
      axios.post(this.dbServerLink + "saveVideoRecord", payload).then((res) => {
        console.log("on: saveVideoRecord: ");
        console.log(res);
        if (res.data["status"] == 200) {
          alert("video saved Successfully :)");
          this.getAllVideos();
        } else {
          alert("video Not Successfull :(");
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
</style>
