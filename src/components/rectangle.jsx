import React, { Component } from "react";
import ResizableRect from 'react-resizable-rotatable-draggable'

class Rectangle extends Component {
    constructor(props) {
        super(props)
        this.state = {
          getCurrentFaceBboxesArray: props.getCurrentFaceBboxesArray,
          getFrameIdx: props.getFrameIdx,
          getVideoFrameRatio: props.getVideoFrameRatio,
          xShift:window.innerWidth-866, //375 550 430 230 window.innerWidth*0.3879  550
          yShift:220, //-200 100 220 220 window.innerHeight*0.2270 220 (-1*window.innerHeight)+1189
          xScale:0.8, //375 550 1.0
          yScale:0.8, //-200 100 1.0 //+(1.0-props.getVideoFrameRatio()[1]-0.25)
          xMulti:0.9, //375 0.7 1.0 props.getVideoFrameRatio()[0]
          yMulti:0.9, //-200 0.7 1.0 props.getVideoFrameRatio()[1]
          windowHeight:window.innerHeight,
          windowWidth:window.innerWidth
        };
      }
    errorHandler = ({ error }) => this.setState({ error });
    onChangeCallback = (selectedInterval) => this.setState({ selectedInterval });
    getDisableEnableFlag = () => {
        console.log("height: "+window.innerHeight);
        console.log("width: "+window.innerWidth);
        this.setState({xShift:window.innerWidth-866});
        //this.setState({yShift:(-1*window.innerHeight)+1189});
    };
    render() {
        window.addEventListener('resize', this.getDisableEnableFlag);
        const ResizableRectList = [];
        if(this.state.getCurrentFaceBboxesArray()){
            console.log(this.state.getCurrentFaceBboxesArray().length);
            console.log(this.state.getFrameIdx());
            var frmIdx = this.state.getFrameIdx();
            var currentBboxxywh = this.state.getCurrentFaceBboxesArray();
            for (var i = 0; i < currentBboxxywh.length; i++) {
                ResizableRectList.push(<ResizableRect
                          top={this.state.yMulti*this.state.getVideoFrameRatio()[1]*(this.state.yShift+currentBboxxywh[i][1])}
                          left={this.state.xMulti*this.state.getVideoFrameRatio()[0]*(this.state.xShift+currentBboxxywh[i][0])}
                          width={currentBboxxywh[i][2]*this.state.xScale}
                          height={currentBboxxywh[i][3]*this.state.yScale}
                          zoomable='n, w, s, e, nw, ne, se, sw' />)
              };

        }
        return (
            <div>
                {ResizableRectList}
            </div>
        );
    }
}

export default Rectangle;