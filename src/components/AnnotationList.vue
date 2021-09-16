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
              <tr v-for="shot in vidShotData" class="table-td-annotation " :key="shot.shot_id" :id="'shot_anno_list_'+shot.shot_id">
                <td width="25%"><img :id="'shot_'+shot.shot_id+'_frame_0'" class="img-shot-frame" src="./../assets/ph_shot_start.png" alt="starting" /></td>
                <td width="25%"><img :id="'shot_'+shot.shot_id+'_frame_1'" class="img-shot-frame" src="./../assets/ph_shot_middle.png" alt="middle" /></td>
                <td width="25%"><img :id="'shot_'+shot.shot_id+'_frame_2'" class="img-shot-frame" src="./../assets/ph_shot_end.png" alt="ending" /></td>
                <td width="25%">
                  <div class="text-align-left text-align-top">
                    Shot Id: {{shot.shot_id}}<br/>
                    Time: {{shot.start_time.slice(3,8)}} - {{shot.end_time.slice(3,8)}}<br/>
                    Duration: {{(shot.end_frame-shot.start_frame)/25}} sec<br/>
                  </div>
                </td>
              </tr>
            </table>
                
        </div>
    </div>
</template>
<script>

import axios from "axios";
//import faceDataTp from './../assets/faceData.json'
//import faceClusterTp from './../assets/faceCluster.json'
export default {
  name: "AnnotationListView",
  annotationType:"shotDetection",
  props: ["type","vidShotData","vidFaceData"],
  //facedata:[],
  //shotdata:[],
  created: function() {
        this.$root.$refs.AnnotationListView = this;
    },
    mounted (){
    },
  data() {
        return {
            metadata:{title:"Title of teh video",
            duration: 120,
            fps:25,
            shotSeqIdx:4,
            shotStartFrameIdx:1,
            shotEndFrameIdx:2,
            shotStartTimeIdx:5,
            shotEndTimeIdx:6,
            source_size:[1080,720],
            faceCounter:1
            },
            occuranceColorTheme:"",
            defaultOccuranceFilterValues:5,
            occuranceFilterValues:[10,15,20,25,30,35,40],
            videoId:"cf13d553ca6aefda1ecefb343b30bd04b860e21a0554ae51aaf0a41c65b666f4",
            videoPath:"media/f9_scene1.mp4",
            faceClustering: [{"cluster_id": 26, "face_ids": [0, 10, 12, 14, 18, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 591, 597, 618, 621], "frame_ids": [39, 157, 158, 159, 161, 762, 763, 764, 765, 766, 767, 768, 769, 770, 771, 772, 773, 774, 775, 776, 777, 777, 778, 779, 780, 982, 984, 994, 995], "occurrences": 29,"color":[Math.floor((Math.random() * 130) + 130),Math.floor((Math.random() * 130) + 130),Math.floor((Math.random() * 130) + 130)]},
{"cluster_id": 9, "face_ids": [1], "frame_ids": [118], "occurrences": 1,"color":[Math.floor((Math.random() * 130) + 130),Math.floor((Math.random() * 130) + 130),Math.floor((Math.random() * 130) + 130)]}],

            faceDetection: [{"bbox_area": 0.005914713721722364, "bbox_xywh": [212, 374, 79, 69], "face_id": 0, "frame_idx": 39},
{"bbox_area": 0.020744357258081436, "bbox_xywh": [661, 365, 121, 158], "face_id": 1, "frame_idx": 118},
{"bbox_area": 0.01796874962747097, "bbox_xywh": [662, 337, 115, 144], "face_id": 2, "frame_idx": 119},
{"bbox_area": 0.02031249925494194, "bbox_xywh": [647, 289, 120, 156], "face_id": 3, "frame_idx": 120},
{"bbox_area": 0.01979166641831398, "bbox_xywh": [636, 238, 114, 160], "face_id": 4, "frame_idx": 121},
{"bbox_area": 0.010104166343808174, "bbox_xywh": [389, 334, 96, 97], "face_id": 5, "frame_idx": 155},
{"bbox_area": 0.007871094159781933, "bbox_xywh": [198, 236, 62, 117], "face_id": 6, "frame_idx": 155},
{"bbox_area": 0.008771701715886593, "bbox_xywh": [403, 307, 86, 94], "face_id": 7, "frame_idx": 156}],
            shotFrames:[],
            faceFrames:[]
        }
    },
  methods: {
    onPlayTimeChange:function () {
    },
    onChangeOccuranceFilter:function (event) {
        console.log("inside onChangeOccuranceFilter: ");
        console.log(event.target);
        this.defaultOccuranceFilterValues = parseInt(document.getElementById("faceOccuranceFilter").value)
        this.getFaceClustersData();
        this.getFacesData();
    },
    onCbShotBoundaryFreyLineChange:function (event){
        console.log("inside onCbShotBoundaryFreyLineChange: ");
        console.log(event.target);
    },
    onShotSearch:function (event){
      console.log("inside onShotSearch: ");
        console.log(event.target);
    },
    onCbFaceDetectorChange:function (event){
        console.log("inside onCbFaceDetectorChange: ");
        console.log(event.target);
    },
    getFaceClusterById:function(id,faceClustering) {
      var idx = 0;
      for(var k=0;k<faceClustering.length;k++){
        if(faceClustering[k].cluster_id == id ){
          idx = k;
        }
      }
      return idx;
    },
    updateFaceOccurance:function(event){
      console.log(event.target);
      var tk1 = event.target.innerText.split("\n")[0];
      var tk2 = parseInt(tk1.split(":")[1].trim());
      var curShotNum = 0;
      var faceClustering = this.$root.$refs.DataViewer.faceClustering;
      var faceDetection = this.$root.$refs.DataViewer.faceDetection;
      var vidShotData = this.$root.$refs.AnnotationListView.vidShotData;
      var cluster_id_computed = tk2;
      var selected = this.getFaceClusterById(cluster_id_computed,faceClustering);
      for(var l=0;l<vidShotData.length;l++){
         //document.getElementById("shot_anno_timeline_1_"+vidShotData[curShotNum].shot_id).className.replace(this.occuranceColorTheme, "");
         document.getElementById("shot_anno_timeline_1_"+vidShotData[l].shot_id).className = "";
      }
      for(var k=0;k<faceClustering[selected].face_ids.length;k++){
        if(faceDetection[k]){
          var frameIdx = faceDetection[k].frame_idx;
          //var timeIdx = frameIdx/fps;
          //console.log(timeIdx);
          if(frameIdx>=vidShotData[curShotNum].start_frame && frameIdx<=vidShotData[curShotNum].end_frame){
            //var colorVal = faceClustering[selected].color;
            //document.getElementById("shot_anno_timeline_1_"+vidShotData[curShotNum].shot_id).style.backgroundColor = "rgb("+colorVal[0]+","+colorVal[1]+","+colorVal[2]+")";
            if(document.getElementById("shot_anno_timeline_1_"+vidShotData[curShotNum].shot_id).className.indexOf(this.occuranceColorTheme)<0){
              document.getElementById("shot_anno_timeline_1_"+vidShotData[curShotNum].shot_id).className += " "+this.occuranceColorTheme;
            }
          }
          if(frameIdx>vidShotData[curShotNum].end_frame){
              curShotNum+=1;
          }
        }
      }
      console.log(tk2);
    },
    sleepFor:function(sleepDuration){
        var now = new Date().getTime();
        while(new Date().getTime() < now + sleepDuration){ /* Do nothing */ }
    },
    checkGettingFaceFramesDone:function(jobId){
      console.log("repeating checkGettingFaceFramesDone");
        axios.get(this.$root.$refs.AnalysisViewerView.baseUrl1 +"get_thumbnails", {params:{"job_id": jobId}}).then((response) => {
           if(response){
                if(response.data.status == "SUCCESS"){
                  //this.sleepFor(2000);
                    console.log("clearing checkGettingFaceFramesDone");
                    clearInterval(this.$root.$refs.AnalysisViewerView.jobsInProcess[jobId]["intervalHandler"]);
                    this.$root.$refs.AnnotationListView.faceFrames = response.data.thumbnails;
                    var frmInnerCnt = {};
                    for(var i=0;i<response.data.thumbnails.length;i++){
                      if(response.data.thumbnails[i].id in frmInnerCnt ){
                        frmInnerCnt[response.data.thumbnails[i].id] += 1;
                      }else{
                        frmInnerCnt[response.data.thumbnails[i].id] = 0;
                      }
                      if(document.getElementById("face_"+response.data.thumbnails[i].id+"_frame_"+frmInnerCnt[response.data.thumbnails[i].id])){
                          document.getElementById("face_"+response.data.thumbnails[i].id+"_frame_"+frmInnerCnt[response.data.thumbnails[i].id]).src="data:image/jpg;base64,"+response.data.thumbnails[i].img;
                      }
                    }

                    //this.$root.$refs.ShotBoundaryView.curVidShotData = this.vid1ShotData;
                      var selected = 0;
                      var curShotNum = 0;
                      var faceClustering = this.$root.$refs.DataViewer.faceClustering;
                      var faceDetection = this.$root.$refs.DataViewer.faceDetection;
                      var vidShotData = this.$root.$refs.AnnotationListView.vidShotData;
                      for(var k=0;k<faceClustering[selected].face_ids.length;k++){
                        if(faceDetection[k]){
                          var frameIdx = faceDetection[k].frame_idx;
                          //var timeIdx = frameIdx/fps;
                          //console.log(timeIdx);
                          if(frameIdx>=vidShotData[curShotNum].start_frame && frameIdx<=vidShotData[curShotNum].end_frame){
                            //var colorVal = faceClustering[selected].color;
                            //document.getElementById("shot_anno_timeline_1_"+vidShotData[curShotNum].shot_id).style.backgroundColor = "rgb("+colorVal[0]+","+colorVal[1]+","+colorVal[2]+")";
                            if(document.getElementById("shot_anno_timeline_1_"+vidShotData[curShotNum].shot_id).className.indexOf(this.occuranceColorTheme)<0){
                              document.getElementById("shot_anno_timeline_1_"+vidShotData[curShotNum].shot_id).className += " "+this.occuranceColorTheme;
                            }
                          }
                          if(frameIdx>vidShotData[curShotNum].end_frame){
                              curShotNum+=1;
                          }
                        }
                      }

                }else if(response.data.status == "PENDING"){
                  var intervalHandler = setInterval(this.checkGettingFaceFramesDone(jobId), this.$root.$refs.AnalysisViewerView.jobRecallTime);
                  this.$root.$refs.AnalysisViewerView.jobsInProcess[jobId] = {"type":"get_face_frames","intervalHandler":intervalHandler};
                }
            }
        });
    },
    checkGettingFaceClustersDone:function(jobId){
      console.log("repeating checkGettingFaceClustersDone");
        axios.get(this.$root.$refs.AnalysisViewerView.baseUrl1 +"cluster_faces", {params:{"job_id": jobId}}).then((response) => {
           if(response){
                if(response.data.status == "SUCCESS"){
                    console.log("clearing checkGettingFaceClustersDone");
                    clearInterval(this.$root.$refs.AnalysisViewerView.jobsInProcess[jobId]["intervalHandler"]);
                    var faceClusters = response.data.face_clusters;
                    var newFaceClusters = [];
                    var colorShift = 50;
                    var colorBase = 150;
                    var faceClusterOccuranceThrehold = this.defaultOccuranceFilterValues;
                    //var faceClusterOccuranceThrehold = parseInt(document.getElementById("faceOccuranceFilter").value);
                    //if(parseInt(document.getElementById("dd_occurance_filter").value)){
                      //faceClusterOccuranceThrehold = parseInt(document.getElementById("dd_occurance_filter").value);
                    //}
                    for(var j=0;j<faceClusters.length;j++){
                      faceClusters[j]["color"] = [Math.floor((Math.random() * colorBase) + colorShift),Math.floor((Math.random() * colorBase) + colorShift),Math.floor((Math.random() * colorBase) + colorShift)];
                      if(faceClusters[j]["occurrences"]>=faceClusterOccuranceThrehold){
                        newFaceClusters.push(faceClusters[j]);
                      }
                    }
                    this.$root.$refs.DataViewer.faceClustering = newFaceClusters;
                    this.$root.$refs.AnnotationListView.faceClustering = this.$root.$refs.DataViewer.faceClustering;
                    console.log(" this.$root.$refs.DataViewer.faceClustering",this.$root.$refs.DataViewer.faceClustering);
                }else if(response.data.status == "PENDING"){
                  var intervalHandler = setInterval(this.checkGettingFaceClustersDone(jobId), this.$root.$refs.AnalysisViewerView.jobRecallTime);
                  this.$root.$refs.AnalysisViewerView.jobsInProcess[jobId] = {"type":"get_face_clusters","intervalHandler":intervalHandler};
                }
            }
        });
    },
    checkGettingFacesDone:function(jobId){
      console.log("repeating checkGettingFacesDone");
        axios.get(this.$root.$refs.AnalysisViewerView.baseUrl1 +"detect_faces", {params:{"job_id": jobId}}).then((response) => {
           if(response){
                if(response.data.status == "SUCCESS"){
                    console.log("clearing checkGettingFacesDone");
                    clearInterval(this.$root.$refs.AnalysisViewerView.jobsInProcess[jobId]["intervalHandler"]);
                    this.$root.$refs.DataViewer.faceDetection = response.data.faces;
                    var thumbnail_face_frames = Array();
                    var faceClustering = this.$root.$refs.DataViewer.faceClustering;
                    var faceDetection = this.$root.$refs.DataViewer.faceDetection;
                    if(faceClustering){
                        for(var j=0;j<faceClustering.length;j++){
                          //var tatalFaces = faceClustering[j].occurrences;
                          //var facesIds= [faceClustering[j].face_ids[0],faceClustering[j].face_ids[parseInt(tatalFaces/2)],faceClustering[j].face_ids[tatalFaces-1]];
                          var facesIds= [faceClustering[j].face_ids[0],faceClustering[j].face_ids[1],faceClustering[j].face_ids[2]];
                          var thresHold = 0;
                          for(var i=0;i<facesIds.length;i++){
                            if(faceClustering[j].occurrences>4){
                              facesIds= [faceClustering[j].face_ids[0],faceClustering[j].face_ids[parseInt(faceClustering[j].occurrences/2)],faceClustering[j].face_ids[faceClustering[j].occurrences-2]];
                            }else{
                              facesIds= [faceClustering[j].face_ids[0],faceClustering[j].face_ids[0],faceClustering[j].face_ids[0]];
                            }
                            if(faceDetection[facesIds[i]]){
                              if(faceClustering[j].occurrences>thresHold){
                                  thumbnail_face_frames.push({"id": faceClustering[j].cluster_id,"idx": faceDetection[facesIds[i]].frame_idx,"bbox_xywh": faceDetection[facesIds[i]].bbox_xywh});
                              }
                                
                            }
                          }
                      }
                      axios.post(this.$root.$refs.AnalysisViewerView.baseUrl1 +"get_thumbnails", {"video_id": this.$root.$refs.AnnotationListView.videoId, "path": this.$root.$refs.AnnotationListView.videoPath, "frames": thumbnail_face_frames}).then((responce) => {
                                  if(responce){
                                      console.log("setting job to thumbnail_face_frames");
                                      var intervalHandler = setInterval(this.checkGettingFaceFramesDone(responce.data.job_id), this.$root.$refs.AnalysisViewerView.jobRecallTime);
                                      this.$root.$refs.AnalysisViewerView.jobsInProcess[responce.data.job_id] = {"type":"get_face_frames","intervalHandler":intervalHandler};
                                  }
                              }); 
                    }else{
                      var intervalHandler2 = setInterval(this.checkGettingFacesDone(jobId), this.$root.$refs.AnalysisViewerView.jobRecallTime);
                      this.$root.$refs.AnalysisViewerView.jobsInProcess[jobId] = {"type":"get_faces","intervalHandler":intervalHandler2};
                    }
                }else if(response.data.status == "PENDING"){
                  var intervalHandler3 = setInterval(this.checkGettingFacesDone(jobId), this.$root.$refs.AnalysisViewerView.jobRecallTime);
                  this.$root.$refs.AnalysisViewerView.jobsInProcess[jobId] = {"type":"get_faces","intervalHandler":intervalHandler3};
                }
            }
        });
    },
    checkGettingShotFramesDone:function(jobId){
      console.log("repeating checkVideoDetectShotsDone");
        axios.get(this.$root.$refs.AnalysisViewerView.baseUrl1 +"get_thumbnails", {params:{"job_id": jobId}}).then((response) => {
           if(response){
                if(response.data.status == "SUCCESS"){
                    console.log("clearing checkGettingFramesDone");
                    clearInterval(this.$root.$refs.AnalysisViewerView.jobsInProcess[jobId]["intervalHandler"]);
                    this.$root.$refs.AnalysisViewerView.shotFrames = response.data.thumbnails;
                    var frmInnerCnt = {};
                    for(var i=0;i<response.data.thumbnails.length;i++){
                      if(response.data.thumbnails[i].id in frmInnerCnt ){
                        frmInnerCnt[response.data.thumbnails[i].id] += 1;
                      }else{
                        frmInnerCnt[response.data.thumbnails[i].id] = 0;
                      }
                      document.getElementById("shot_"+response.data.thumbnails[i].id+"_frame_"+frmInnerCnt[response.data.thumbnails[i].id]).src="data:image/jpg;base64,"+response.data.thumbnails[i].img;
                      
                    }
                    
                }else if(response.data.status == "PENDING"){
                  var intervalHandler = setInterval(this.checkGettingShotFramesDone(jobId), this.$root.$refs.AnalysisViewerView.jobRecallTime);
                  this.$root.$refs.AnalysisViewerView.jobsInProcess[jobId] = {"type":"get_shot_frames","intervalHandler":intervalHandler};
                }
            }
        });
      
    },
    getFacesData: function() {
       //axios.post(this.$root.$refs.AnalysisViewerView.baseUrl1 +"detect_faces", {"video_id": video_id, "path": vidPath}).then((responce) => {
        axios.post(this.$root.$refs.AnalysisViewerView.baseUrl1 +"detect_faces", {"video_id": this.$root.$refs.AnnotationListView.videoId, "path": this.$root.$refs.AnnotationListView.videoPath}).then((responce) => {
                    if(responce){
                        console.log("setting job to get frames for shots");
                        var intervalHandler = setInterval(this.checkGettingFacesDone(responce.data.job_id), this.$root.$refs.AnalysisViewerView.jobRecallTime);
                        this.$root.$refs.AnalysisViewerView.jobsInProcess[responce.data.job_id] = {"type":"get_faces","intervalHandler":intervalHandler};
                    }
                });
       

    },
    getFaceClustersData: function() {
       axios.post(this.$root.$refs.AnalysisViewerView.baseUrl1 +"cluster_faces", {"video_id": this.$root.$refs.AnnotationListView.videoId, "path": this.$root.$refs.AnnotationListView.videoPath}).then((responce) => {
                    if(responce){
                        console.log("setting job to get frames for shots");
                        var intervalHandler = setInterval(this.checkGettingFaceClustersDone(responce.data.job_id), this.$root.$refs.AnalysisViewerView.jobRecallTime);
                        this.$root.$refs.AnalysisViewerView.jobsInProcess[responce.data.job_id] = {"type":"get_face_clusters","intervalHandler":intervalHandler};
                    }
                });
    },
    updateShotsList: function() {
      var thumbnail_frames = Array();
      this.vidShotData = this.$root.$refs.DataViewer.curVidShotData;
      //this.vidShotData = this.$root.$refs.AnalysisViewerView.curVidShotData;
      for(var i=0;i<this.vidShotData.length;i++){
        var frames = [this.vidShotData[i]["start_frame"],parseInt(this.vidShotData[i]["start_frame"]+((this.vidShotData[i]["end_frame"]-this.vidShotData[i]["start_frame"])/2)), this.vidShotData[i]["end_frame"]]
        for(var j=0;j<frames.length;j++){
            thumbnail_frames.push({"id": this.vidShotData[i]["shot_id"],"idx": frames[j],"bbox_xywh": null});
        };
      }
      var video_id = this.$root.$refs.AnalysisViewerView.vidId;
      var vidPath = this.$root.$refs.AnalysisViewerView.vidPath;
      axios.post(this.$root.$refs.AnalysisViewerView.baseUrl1 +"get_thumbnails", {"video_id": video_id, "path": vidPath, "frames": thumbnail_frames}).then((responce) => {
                    if(responce){
                        console.log("setting job to get frames for shots");
                        var intervalHandler = setInterval(this.checkGettingShotFramesDone(responce.data.job_id), this.$root.$refs.AnalysisViewerView.jobRecallTime);
                        this.$root.$refs.AnalysisViewerView.jobsInProcess[responce.data.job_id] = {"type":"get_shot_frames","intervalHandler":intervalHandler};
                        this.getFacesData();
                        this.getFaceClustersData();
                    }
                });

     }
    },
    mounted: function() {
    }
}   

</script>


<style>
.annotation-list-font{
  font-size: 12px !important;
}
.annotation-list-pad-margin{
  padding: 0px;
  margin: opx;
}
.text-align-top {
  vertical-align: top;
}
</style>
