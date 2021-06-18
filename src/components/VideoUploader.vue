<template>
    <div>
        <div class="container text-align-left">
            <div class="row">
                <h4>Video Analysis Queue</h4>
                <table width="100%" class="text-color">
                    <tbody>
                        <tr class="border-down">
                            <th class="text-align-left">Video File</th>
                            <th class="text-align-left">Video Extention</th>
                            <th class="text-align-left">Status</th>
                            <th class="text-align-left">File Location</th>
                            <th class="text-align-left">Actions</th>
                        </tr>
                        <tr class="border-down" height="40px">
                            <th class="text-align-left">Crash Course Engineering Preview English</th>
                            <th class="text-align-left">*.mp4</th>
                            <th class="text-align-left"><i class="fa fa-spinner fa-pulse fa-lg"></i></th>
                            <th class="text-align-left">https://127.0.0.1:21/videos/</th>
                            <th class="text-align-left"><a href="#">Process</a> | <a href="#">Load</a></th>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br/>
            <br/>
<!--             <div class="row">
                <div class="col-sm-10">
                    <button class="btn btn-primary" id="videoFilebtn"  @click="onFileUpload2($event)">Upload</button>
                    </div>
                </div>
            <br/> -->
            <div class="row">
                <form id="upload_form" enctype="multipart/form-data" method="post">
                    <div class="col-sm-12">
                        <input type="file" name="file1" id="file1" @change="uploadFile"><br>
                        <progress id="progressBar" value="0" max="100" style="width:1100px;"></progress>
                        <h3 id="status"></h3>
                        <p id="loaded_n_total"></p>
                    </div>
                </form>
            </div>
            <br/>
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
                    <form id="upload_form_2">
                        <div class="form-group row">
                            <label for="title" class="col-sm-2 col-form-label">Title</label>
                            <div class="col-sm-10">
                            <input class="form-control" id="title" placeholder="Title of the video">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="titleSeries" class="col-sm-2 col-form-label">Title of Series</label>
                            <div class="col-sm-10">
                            <input class="form-control" id="titleSeries" placeholder="Title of the Video Series (Optional)">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="authorName" class="col-sm-2 col-form-label">Video's Owner</label>
                            <div class="col-sm-10">
                            <input class="form-control" id="authorName" placeholder="Video's Owner Name (If different than logged in user)">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="authorEmail" class="col-sm-2 col-form-label">Video's Owner Email</label>
                            <div class="col-sm-10">
                            <input type="email" class="form-control" id="authorEmail" placeholder="Video's Owner Email (If different than logged in user email)">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="licence" class="col-sm-2 col-form-label">Licence</label>
                            <div class="col-sm-10">
                                <select class="custom-select" id="licence" required>
                                <option value="">Select Licence</option>
                                <option value="1">licence 1</option>
                                <option value="2">licence 2</option>
                                <option value="3">licence 3</option>
                                </select>
                            </div>
                            <div class="invalid-feedback">This value is not valid</div>
                        </div>
                        <div class="form-group row">
                            <label for="idetifier" class="col-sm-2 col-form-label">Identifiers</label>
                            <div class="col-sm-10">
                            <input class="form-control" id="idetifier" placeholder="Identifiers DOI or URL">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="releaseDate" class="col-sm-2 col-form-label">Release Date</label>
                            <div class="col-sm-10">
                            <input type="date" class="form-control" id="releaseDate" placeholder="Release Date">
                            </div>
                        </div>
                        <div class="form-group row">
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
                        </div>
                        <div class="form-group row">
                            <div class="col-sm-10">
                                <button class="btn btn-primary" v-on:click="onFormSubmit">Submit</button>
                            </div>
                        </div>
                        </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
  name: "VideoUploaderView",
  data: function() {
        return { myFiles: "empty" };
    },
  methods: {
    handleFilePondInit: function() {
        console.log('FilePond has initialized');
    },
    onFormSubmit: function() {
        var allInputs = document.getElementById("upload_form_2").getElementsByTagName("input");
        console.log('in submitted: ',allInputs);
        var allInputsArr = new Array();
        for(var i=0;i<allInputs.length;i++){
            allInputsArr.push({"id":allInputs[0].id,"value":allInputs[0].value});
        }
        axios.post("http://localhost:5000/"+"saveVideoFormalMetadata", { "user_id": "junaid","videoFormalMetadata":allInputsArr,"timeStamp":new Date().getTime()}).then((res) => {
            console.log("on: saveVideoFormalMetadata: ");
            console.log(res);
        });
    }
    ,
    onFileUpload: function($event) {
        console.log('in onFileUpload');
        console.log($event);
        console.log('loaded');
        console.log($event.loaded);
        console.log('total');
        console.log($event.total);
    },
    onFileUpload2: function($event) {
        console.log('in onFileUpload');
        console.log($event);
        axios.post("http://localhost:5000/saveVideo", { "job_id": "", "files": document.getElementById("videoFile").files }).then((res) => {
            console.log("results: onFileUpload: ");
            console.log(res);
        });
    },
    progressHandler:function(event) {
    document.getElementById("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
    var percent = (event.loaded / event.total) * 100;
    document.getElementById("progressBar").value = Math.round(percent);
    document.getElementById("status").innerHTML = Math.round(percent) + "% uploaded... please wait";
    },
    completeHandler: function(event) {
        var response = JSON.parse(event.target.response);
        console.log("respionse is : ",response);
        if(response["feedback"]){
            document.getElementById("status").innerHTML = "<h5 class='text-color-green'>Upload Successfully</h5>";
        document.getElementById("progressBar").value = 100; 
        }else{
            document.getElementById("status").innerHTML = "<h5 class='text-color-red'>Upload Failed</h5>";
            document.getElementById("progressBar").value = 0;
        }
        
    },
    errorHandler:function() {
    document.getElementById("status").innerHTML = "Upload Failed";
    },
    abortHandler:function () {
    document.getElementById("status").innerHTML = "Upload Aborted";
    },
    uploadFile: function() {
        var file = document.getElementById("file1").files[0];
        var formdata = new FormData();
        formdata.append("file1", file);
        var ajax = new XMLHttpRequest();
        ajax.upload.addEventListener("progress", this.progressHandler, false);
        ajax.addEventListener("load", this.completeHandler, false);
        ajax.addEventListener("error",this.errorHandler, false);
        ajax.addEventListener("abort",this.abortHandler, false);
        ajax.open("POST", "http://localhost:5000/saveVideo");
        ajax.send(formdata);
    }
  },
  mounted:function() {
  }
}
</script>


<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
</style>
