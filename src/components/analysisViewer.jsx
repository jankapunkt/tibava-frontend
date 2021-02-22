import React, { Component } from "react";
//import ReactPlayer from 'react-player'
import videoSample1 from './../assets/Crash_Course_Engineering_Preview_-_English.mp4';
import videoSample2 from './../assets/Electronic_Computing__Crash_Course_Computer_Science_2_-_English_csyt.mp4';
import Rectangle from "./rectangle";
import FaceAnalysisGraph from "./faceAnalysisGraph";
import RangeSlider from 'react-bootstrap-range-slider';

class AnalysisViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
          videoBase:"/static/media/",
          videoLink:"Crash_Course_Engineering_Preview_-_English.mp4",
          data:{fps:25},
          vidId:1,
          frameIdx:0,
          currentTime:0,
          coveredTime:0,
          duration:0,
          currentBoxValues:[[300,500,80,80]],
          faceAreaArr:[{ name: "0", f1: 0.40, f2: 0.24},
                        { name: "15", f1: 0.30, f2: 0.18 },
                        { name: "30", f1: 0.20, f2: 0.90 },
                        { name: "45", f1: 0.20, f2: 0.38},
                        { name: "60", f1: 0.10, f2: 0.40 },
                        { name: "75", f1: 0.20, f2: 0.30},
                        { name: "90", f1: 0.39, f2: 0.40 }]
        };
        this.videoDict = {
            1:videoSample1,
            2:videoSample2
            };
        this.videoNames = {
            1:"Crash_Course_Engineering_Preview_-_English.mp4",
            2:"Electronic_Computing__Crash_Course_Computer_Science_2_-_English_csyt.mp4"
            };
        this.onPlayTimeChange = this.onPlayTimeChange.bind(this);
        this.getFaceDetectionResults = this.getFaceDetectionResults.bind(this);
        this.fps = 25 ;
        this.curentPlayTime = 0;
        this.video_player = React.createRef();
        this.valSlider = React.createRef();
      }

    getAllBboxInArray(face_detectionArr){
        var allBboxArr =[];
        for (var i = 0; i < face_detectionArr.length; i++) {
            allBboxArr.push(face_detectionArr[i].bbox_xywh);
        }
        return allBboxArr;
    };
    getFrameIdx= () => {
        return this.state.frameIdx;
    };
    getCoveredTimeValue=()=>{
    return (this.state.currentTime/this.state.duration)*100
    };
    onPlayTimeChange = (e) => {
        console.log("the time is: ");
        console.log(e.target.currentTime);
        this.setState({coveredTime:(e.target.currentTime/e.target.duration)*100});
        if(this.state.data.face_detection){
            console.log(Object.keys(this.state.data.face_detection).length);
            var frameIdx = parseInt(e.target.currentTime*this.state.data.fps);
            console.log(frameIdx);
            this.setState({frameIdx:frameIdx});
        }
    };
    setFaceDetectionAreas(data){
        var faceAreaArr=[];
        var data = data;
        var fps_half = parseInt(data.fps/1);
        for (var i = 0; i < Object.keys(data.face_detection).length;) {
            var currentObj = {name:String(i)};
            for (var j= 0; j < data.max_n_faces;j++) {
                currentObj["f"+String(j+1)] = 0;
            }
            for (var j= 0; j < data.face_detection[i].length;j++) {
                currentObj["f"+String(j+1)] = data.face_detection[i][j].bbox_area;
            }
            faceAreaArr.push(currentObj);
            i = i+fps_half
        }
        console.log("computed faceAreaArr: ")
        console.log(faceAreaArr)
        return faceAreaArr;
    };
    getFaceDetectionAreas= () =>{
     return this.state.faceAreaArr;
    }
    computeFaceBboxeArray= () =>{
        var data = this.state.data;
        var faceBboxesArr=[];
        var halFpsJump = parseInt(data.fps/2);
        if(data.face_detection){
            if(Object.keys(data.face_detection).length > 0){
             for (var i= 0; i< Object.keys(data.face_detection).length;i++) {
                var bboxArr = [];
                 for (var j= 0; j< data.face_detection[i].length;j++) {
                        bboxArr.push(data.face_detection[i][j].bbox_xywh);
                    }
                faceBboxesArr.push(bboxArr);
            }
        }
        return faceBboxesArr;
        }
        return faceBboxesArr;
    };
    getCurrentFaceBboxesArray= () =>{
        return this.state.currentBoxValues[this.state.frameIdx];
    };
    getCurrentVideoSource= () =>{
        return this.videoDict[this.state.vidId]
    };
    getFaceDetectionResults = (e) => {
         e.preventDefault();
         const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                "title": e.target.name,
                "path": "media/"+e.target.name
            })
        };
        fetch("http://localhost:5000/detect_faces/"+e.target.id,requestOptions)
        .then(res => res.json())
        .then((data) => {
            this.setState({data:data,vidId:e.target.id})
            console.log("set vidId: ")
            console.log(this.videoDict[this.state.vidId])
            //console.log(this.video_player.current.baseURI+this.videoDict[this.state.vidId])
            //this.video_player.current.currentSrc = this.video_player.current.baseURI+this.videoDict[this.state.vidId]
            this.setState({currentBoxValues:this.computeFaceBboxeArray(data)})
            console.log("DataLoaded Now Inner: ")
            console.log(this.state.data)
            this.setState({faceAreaArr:this.setFaceDetectionAreas(data)})


        })
        .catch(error => this.setState({ error}));
     };
  render() {
    return (
    <div>
        <div>
            <table border='1px' width="100%">
            <tbody>
                <tr>
                    <th width="30%" class="text-align-left">
                        <fieldset>
                            <legend>Example Videos</legend>
                                <ol>
                                  <li><a id="1" href="" name={this.videoNames[1]} onClick={this.getFaceDetectionResults}>Crash Course Engineering Preview English</a></li>
                                  <li><a id="2" href="" name={this.videoNames[2]} onClick={this.getFaceDetectionResults}>Electronic Computing Crash Course Computer Science 2 English csyt</a></li>
                                </ol>
                        </fieldset>
                    </th>
                    <th width="50%"><video id="media_player" ref={this.video_player} width="100%" height="400" onTimeUpdate={this.onPlayTimeChange} controls><source src={this.videoDict[this.state.vidId]} type="video/mp4"/></video></th>
                    <th width="20%" class="text-align-left">
                        <fieldset>
                            <legend>Enabled Options?</legend>
                            <input type="checkbox" name="face_detection" value="face_detection"/>Face Detection<br/>
                            <input type="checkbox" name="rgb_histogram" value="rgb_histogram"/>RGB Histogram<br/>
                            <input type="checkbox" name="entity_detection" value="entity_detection"/>Entity Detection<br/>
                            <br/>
                        </fieldset>
                    </th>
                </tr>
                <tr>
                    <th width="25%"></th>
                    <th width="50%"><input type="range" min="0" max="100" value={this.state.coveredTime} class="slider" /><FaceAnalysisGraph faceAreaArrForGraph={this.state.faceAreaArr}/></th>
                    <th width="25%"></th>
                </tr>
            </tbody>
            </table>
        </div>
        <div>
            <Rectangle width={80} height={80} top={300} left={500} getCurrentFaceBboxesArray={this.getCurrentFaceBboxesArray} getFrameIdx={this.getFrameIdx}/>
        </div>
    </div>
    );
  }
}

export default AnalysisViewer;