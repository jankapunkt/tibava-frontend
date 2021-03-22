import React, { Component } from "react";

class AnnotationForm extends Component {
    constructor(props) {
        super(props)
        this.state ={
        getCurrentFaceBboxesArray: props.getCurrentFaceBboxesArray,
        disable:props.disable,
        submit:props.submit,
        annotationType:"sceneBoundary"
        };
        this.inputRef = {"sceneBoundary":React.createRef(),"faceRectangle":React.createRef()};
        this.input2 = React.createRef();
        this.input3 = React.createRef();
        this.attributeDict ={"sceneBoundary":[["startTime","Start Time"],["endTime","End Time"]],
                             "sceneBoundaryValues":this.state.getCurrentFaceBboxesArray,
                             "faceRectangle":[["xCoordinate","X"],["yCoordinate","Y"],["width","Width"],["height","Height"]],
                             "faceRectangleValues":this.state.getCurrentFaceBboxesArray,
                             "storyClass":[["storyClass"," Story Class Name"]],
                             "storyClassValues":this.state.getCurrentFaceBboxesArray,
                             "videoClass":[["videoClass"," Video Class Name"]],
                             "videoClassValues":this.state.getCurrentFaceBboxesArray};
      }
    getSubmitBtn = () => {
        if(this.state.submit){
            return <input type="submit" className="btn-stl bg-btn-gr" value="Submit" />
        }
    };

    getDisableEnableFlag = () => {
        if(this.state.disable){
         return "disabled";
        }
        else{
         return "enabled";
        }
    };

    onAnnotationTypeChange = (e) => {
        console.log("onAnnotationTypeChange");
        console.log(e.target.value);
        this.setState({annotationType:e.target.value});
    };

    render() {
        var disabledInputClass = "form-input";
        if(this.state.disable){
            //disabledInputClass = "form-input disabled-input";
            disabledInputClass = "form-input";
        }
        var elementsToRender = [];
        console.log("in form getCurrentFaceBboxesArray:");
        //console.log(this.state.getCurrentFaceBboxesArray());
        for (var i = 0; i < this.attributeDict[this.state.annotationType].length; i++) {
            var arrCurrent = this.attributeDict[this.state.annotationType][i];
            var thisAttVal = this.attributeDict[this.state.annotationType+"Values"]();
            if(true){
                if(thisAttVal && thisAttVal.length>0){
                thisAttVal = thisAttVal[0][i];
                }
            }

            elementsToRender.push(<tr>
                            <th width="50%" className="text-align-left"><label for={arrCurrent[0]}>{arrCurrent[1]}</label></th>
                            <th width="25%" className="text-align-left"><input className="form-input" type="text" name={arrCurrent[0]} placeholder={arrCurrent[1]} /></th>
                            <th width="25%" className="text-align-left"><input className="form-input disabled-input" type="text" name={arrCurrent[0]} placeholder={arrCurrent[1]} value={thisAttVal}/></th>
                            </tr>);
        }
        return (
            <div>
                <form action="">
                    <table border='0px' width="100%">
                        <tbody>
                            <tr>
                            <th width="50%" className="text-align-left"><label>Label</label></th>
                            <th width="25%" className="text-align-left"><label>Manual Annotation</label></th>
                            <th width="25%" className="text-align-right"><label>Automatic Annotation</label></th>
                            </tr>
                            <tr>
                            <th width="50%" className="text-align-left"><label for="annotationType">Annotation</label></th>
                            <th width="50%" colspan="2" className="text-align-left">
                                <select className={disabledInputClass} name="annotationType" onChange={this.onAnnotationTypeChange} ref={this.input3} value={this.state.annotationType}>
                                  <option value="videoClass">Video Class</option>
                                  <option value="storyClass">Story Class</option>
                                  <option value="sceneBoundary">Scene Boundary</option>
                                  <option value="faceRectangle">Face Rectangle</option>
                                </select>
                            </th>
                            </tr>
                            {elementsToRender}
                            <tr>
                                <th colspan="2" className="text-align-right"><button className="btn-stl bg-cb-bl" type="submit">save</button></th>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        );
    }
}

export default AnnotationForm;