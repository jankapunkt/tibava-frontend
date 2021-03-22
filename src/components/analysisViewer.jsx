import React, { Component } from "react";
//import ReactPlayer from 'react-player'
import videoSample1 from './../media/Crash_Course_Engineering_Preview_-_English.mp4';
import videoSample2 from './../media/Electronic_Computing__Crash_Course_Computer_Science_2_-_English_csyt.mp4';
import Rectangle from "./rectangle";
import FaceAnalysisGraph from "./faceAnalysisGraph";
import RangeSlider from 'react-bootstrap-range-slider';
import ShotBoundaryViewer from "./shotBoundaryViewer";
import AnnotationForm from "./annotationForm";
class AnalysisViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
          videoBase:"/static/media/",
          videoLink:"Crash_Course_Engineering_Preview_-_English.mp4",
          data:{fps:25},
          sceneData:{},
          vidId:1,
          frameIdx:0,
          currentTime:0,
          coveredTime:0,
          coveredTimeStartShift:9,
          duration:0,
          faceDetectors:"display-visible",
          faceAreaGraph:"display-visible",
          shotBoundaries:"display-visible",
          currentBoxValues:[[300,500,80,80]],
          faceAreaArr:[{ frameNum: "0", f1: 0.40, f2: 0.24},
                        { frameNum: "15", f1: 0.30, f2: 0.18 },
                        { frameNum: "30", f1: 0.20, f2: 0.90 },
                        { frameNum: "45", f1: 0.20, f2: 0.38},
                        { frameNum: "60", f1: 0.10, f2: 0.40 },
                        { frameNum: "75", f1: 0.20, f2: 0.30},
                        { frameNum: "90", f1: 0.39, f2: 0.40 }]
        };
        this.videoDict = {
            1:videoSample1,
            2:videoSample2
            };
        this.videoNames = {
            1:"Crash_Course_Engineering_Preview_-_English.mp4",
            2:"Electronic_Computing__Crash_Course_Computer_Science_2_-_English_csyt.mp4"
            };
        this.videoShape = {
            1:[1280, 720],
            2:[900, 500] //[640, 360]
            };
        this.onPlayTimeChange = this.onPlayTimeChange.bind(this);
        this.getFaceDetectionResults = this.getFaceDetectionResults.bind(this);
        this.fps = 25 ;
        this.baseFrameWidthHeight = [900, 500] ;
        this.videoFrameRatio = [this.baseFrameWidthHeight[0]/this.videoShape[1][0], this.baseFrameWidthHeight[1]/this.videoShape[1][1]];
        this.curentPlayTime = 0;
        this.video_player = React.createRef();
        this.valSlider = React.createRef();
        this.cbFaceDetectors = React.createRef();
        this.cbFaceAreaGraph = React.createRef();
        this.cbShotBoundaries = React.createRef();
        this.sceneData2 = [];
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
    getFrameRate= () => {
        return this.state.data.fps;
    };
    getCoveredTimeValue=()=>{
    return (this.state.currentTime/this.state.duration)*100
    };
    setCheckboxDefault = () => {
        this.cbFaceDetectors.current.checked=true;
        this.cbShotBoundaries.current.checked=true;
        this.cbFaceAreaGraph.current.checked=true;
    };
    onCheckboxChange = (e) => {
        console.log("onCheckboxChange: ");
        console.log(e.target.checked);
        if(e.target.value==="faceDetectors"){
            e.target.checked? this.setState({faceDetectors:"display-visible"}):this.setState({faceDetectors:"display-hidden"});
        }
        else if(e.target.value==="faceAreaGraph"){
            e.target.checked? this.setState({faceAreaGraph:"display-visible"}):this.setState({faceAreaGraph:"display-hidden"});
        }
        else if(e.target.value==="shotBoundaries"){
            e.target.checked? this.setState({shotBoundaries:"display-visible"}):this.setState({shotBoundaries:"display-hidden"});
        }
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
            var currentObj = {frameNum:String(parseInt(i/data.fps))};
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
    };
    getVideoFrameRatio=()=>{
        return this.videoFrameRatio;
    };
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
    getCurrentShotArray= () =>{
        return this.state.sceneData;
    };
    getShotDetectionResults = (e) => {
         e.preventDefault();
         const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                "title": e.target.name,
                "path": "media/"+e.target.name
            })
        };
        fetch("http://localhost:5000/detect_shots/"+e.target.id,requestOptions)
        .then(res => res.json())
        .then((data) => {
            console.log("shot data: ")
            console.log(data)
            this.setState({sceneData:data})
        })
        .catch(error => this.setState({ error}));
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
            this.videoFrameRatio = [this.baseFrameWidthHeight[0]/this.videoShape[this.state.vidId][0], this.baseFrameWidthHeight[1]/this.videoShape[this.state.vidId][1]];
            //console.log(this.video_player.current.baseURI+this.videoDict[this.state.vidId])
            //this.video_player.current.currentSrc = this.video_player.current.baseURI+this.videoDict[this.state.vidId]
            this.setState({currentBoxValues:this.computeFaceBboxeArray(data),faceAreaArr:this.setFaceDetectionAreas(data)})
            console.log("DataLoaded Now Inner: ")
            console.log(this.state.data)
            this.getShotDetectionResults(e)
            this.setCheckboxDefault()
        })
        .catch(error => this.setState({ error}));
     };

  render() {
    return (
    <div>
        <div>
            <table border='0px' width="100%">
            <tbody>
                <tr>
                    <th width="30%" className="text-align-left">
                        <div class="tabset">
                          <input type="radio" name="tabset" id="tab1" aria-controls="sec1" checked />
                          <label for="tab1">Current</label>
                          <input type="radio" name="tabset" id="tab2" aria-controls="sec2" />
                          <label for="tab2">Other</label>
                          <div class="tab-panels">
                            <section id="sec1" class="tab-panel">
                              <h2>Example Videos</h2>
                                <ol>
                                  <li><a id="1" className="video-links" href="" name={this.videoNames[1]} onClick={this.getFaceDetectionResults}>Crash Course Engineering Preview English</a></li>
                                  <li><a id="2" className="video-links" href="" name={this.videoNames[2]} onClick={this.getFaceDetectionResults}>Electronic Computing Crash Course Computer Science 2 English csyt</a></li>
                                </ol>
                              </section>
                              <section id="sec2" class="tab-panel">
                                  <h2>content-2</h2>
                                  <p>Other content will be places here when needed</p>
                              </section>
                          </div>
                        </div>
                    </th>
                    <th width="50%"><div id="media_player_div"><video id="media_player" ref={this.video_player} width="100%" height="300" onTimeUpdate={this.onPlayTimeChange} src={this.videoDict[this.state.vidId]} controls></video></div></th>
                    <th width="20%" className="text-align-left">
                        <h2>Annotations</h2>
                            <div className="bg-cb-bl bg-rad-3 pd-cb mrg-cb"><input ref={this.cbFaceDetectors}  type="checkbox" name="cbFaceDetectors" value="faceDetectors" onChange={this.onCheckboxChange}/>Face Detectors<br/></div>
                            <div className="bg-cb-gr bg-rad-3 pd-cb mrg-cb"><input ref={this.cbFaceAreaGraph} type="checkbox" name="cbFaceAreaGraph" value="faceAreaGraph" onChange={this.onCheckboxChange}/>Face Area Graph<br/></div>
                            <div className="bg-cb-yl bg-rad-3 pd-cb mrg-cb"><input ref={this.cbShotBoundaries} type="checkbox" name="cbShotBoundaries" value="shotBoundaries" onChange={this.onCheckboxChange}/>Shot Boundaries<br/></div>
                    </th>
                </tr>
                <tr>
                    <th width="25%"><AnnotationForm disable={false} submit={true} getCurrentFaceBboxesArray={this.getCurrentFaceBboxesArray}/></th>
                    <th width="50%">
                        <div className={this.state.shotBoundaries}><ShotBoundaryViewer video_player={this.video_player} getFrameRate={this.getFrameRate} getCurrentShotArray={this.getCurrentShotArray} getFrameIdx={this.getFrameIdx} /></div>
                        <input ref={this.valSlider} type="range" min="0" max={this.state.coveredTimeStartShift+100} value={this.state.coveredTimeStartShift+this.state.coveredTime} className="slider" />
                        <div className={this.state.faceAreaGraph}><FaceAnalysisGraph faceAreaArrForGraph={this.state.faceAreaArr}/></div>
                    </th>
                    <th width="25%"></th>
                </tr>
            </tbody>
            </table>
        </div>
        <div className={this.state.faceDetectors}>
            <Rectangle width={80} height={80} top={300} left={500} getFrameRate={this.getFrameRate} video_player={this.video_player} getCurrentFaceBboxesArray={this.getCurrentFaceBboxesArray} getFrameIdx={this.getFrameIdx} getVideoFrameRatio={this.getVideoFrameRatio}/>
        </div>
    </div>
    );
  }
}

export default AnalysisViewer;