import React, { Component } from "react";
import ResizableRect from 'react-resizable-rotatable-draggable'

class Rectangle extends Component {
    constructor(props) {
        super(props)
        this.state = {
          getCurrentFaceBboxesArray: props.getCurrentFaceBboxesArray,
          getFrameIdx: props.getFrameIdx,
          xShift:-200,
          yShift:400
        };
      }
    errorHandler = ({ error }) => this.setState({ error });
    onChangeCallback = (selectedInterval) => this.setState({ selectedInterval });
    render() {
        const ResizableRectList = [];
        console.log(this.state.getCurrentFaceBboxesArray().length);
        console.log(this.state.getFrameIdx());
        var frmIdx = this.state.getFrameIdx();
        var currentBboxxywh = this.state.getCurrentFaceBboxesArray();
        for (var i = 0; i < currentBboxxywh.length; i++) {
            ResizableRectList.push(<ResizableRect
                      top={this.state.xShift+currentBboxxywh[i][0]}
                      left={this.state.yShift+currentBboxxywh[i][1]}
                      width={currentBboxxywh[i][2]}
                      height={currentBboxxywh[i][3]}
                      zoomable='n, w, s, e, nw, ne, se, sw' />)
          };
        return (
            <div>
                {ResizableRectList}
            </div>
        );
    }
}

export default Rectangle;