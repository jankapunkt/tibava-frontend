import React, { Component } from "react";
import sampelFrame1 from './../media/constFrame1.png';
import sampelFrame2 from './../media/constFrame2.png';

class ShotBoundaryViewer extends Component {
    constructor(props) {
        super(props)
        this.state = {
        getCurrentShotArray: props.getCurrentShotArray,
        getFrameIdx: props.getFrameIdx,
        getVideoPlayer:props.getVideoPlayer,
        getFrameRate:props.getFrameRate,
        video_player:props.video_player
        };
        this.sampleFrames = [sampelFrame1,sampelFrame2];
        this.shotBoundaryList = [];
      }
    updatePlayTimeForScene = (e) => {
        //console.log("this scene id: "+e.target.id);
        //console.log("str frame: "+this.shotBoundaryList.scenes[e.target.id].start_frame);
        //console.log("fps: "+this.state.getFrameRate());
        var calculatedTime = this.shotBoundaryList.scenes[e.target.id].start_frame/this.state.getFrameRate();
        //console.log("current calculated time: "+calculatedTime);
        //console.log("video_player"+this.state.video_player)
        // below need to converted to react reference to the element
        document.getElementById("media_player").currentTime=calculatedTime;
    };
    render() {
        this.shotBoundaryList= this.state.getCurrentShotArray();
        var boundaryData = this.shotBoundaryList;
        var elementsToRender = [];
        if(boundaryData && boundaryData.scenes){
            //console.log("In module shot boundary: ");
            //console.log(boundaryData);
            var totalFrames = boundaryData.scenes[boundaryData.scenes.length-1].end_frame;
            for (var i = 0; i < boundaryData.scenes.length; i++) {
                var percentage = ((boundaryData.scenes[i].end_frame-boundaryData.scenes[i].start_frame)/totalFrames)*100+"%";
                var shot_id = ""+boundaryData.scenes[i].scene_id;
                //console.log("th added: "+i+" "+percentage);
                elementsToRender.push(<th className="scene-timeline-a" width={percentage} id={shot_id} onClick={this.updatePlayTimeForScene}><div class="tooltip"><span class="tooltiptext"><img src={this.sampleFrames[0]} width="120px" alt="" /></span></div></th>);
              };
        }
        return (
            <table width="100%">
                <tr height="15px">
                    <th className="scene-timeline-buffer" width="10%"></th>
                    {elementsToRender}
                </tr>
            </table>
        );
    }
}

export default ShotBoundaryViewer;