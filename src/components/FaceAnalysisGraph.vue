<template>
  <div class="panel-content">
    <div class="face-graph" width="100%">
        <TrendChart
          :datasets="datasets"
          :grid="grid"
          :labels="labels" :min="0">
        </TrendChart>
    </div>
  </div>
</template>

<script>


export default {
  name: "FaceAnalysisGraphViewer",
  props: ["vidFaceData","vidMetadata","vidShotData"],
  data() {
    
    return {
      xVal:[70, 100, 400, 180, 100, 300, 500],
      yVal:5,
      datasets: [
        {
          data: [70, 100, 400, 180, 100, 300, 500],
          smooth: true,
          showPoints: true,
          className: "curve1"
        }
      ],
      grid: {
        verticalLines: true,
        horizontalLines: true
      },
      labels: { 
        xLabels:[70, 100, 400, 180, 100, 300, 500],
        yLabels: 5,
        yLabelsTextFormatter: val => Math.round(val * 100) / 100
      },
      tooltipData: null,
      popper: null,
      popperIsActive: false,
      maxFaces:null,
      curMetadata:null,
      curFaceData:null,
    };
  },
  methods: {
      onPlayTimeChange() {
      },
      getXVal(){
        return this.xVal;
      },
      getYVal(){
        return this.yVal;
      },
      getDataForGraph(){
        
      }
  },
  updated: function() {
    this.curMetadata = this.vidMetadata;
    this.curFaceData = this.vidFaceData;
    var timeInt = parseInt(this.curMetadata.duration);
    var fps = this.curMetadata.fps;
    this.xVal= new Array(timeInt);
    this.yVal= new Array(timeInt);
    for(var j=0;j<timeInt;j++){  
      this.xVal[j] = j;
      this.yVal[j] = Math.floor(Math.random() * 5);
    };
    var idx = 0;
    this.maxFaces = 0;
    var localMaxFace = 0;
    for(var i=0;i<this.curFaceData.length;i++){  
      idx = parseInt(this.curFaceData[i].frame_idx/fps);
      this.yVal[idx] = this.curFaceData[i].bbox_area;
      if(i>0 && this.curFaceData[i].frame_idx == this.curFaceData[i-1].frame_idx){
        localMaxFace+=1;
      }
      else{
        localMaxFace=0;
      }
      if(localMaxFace>this.maxFaces){
        this.maxFaces=localMaxFace;
      }
    };
    this.datasets[0].data = this.xVal;
    this.labels.xLabels = this.xVal;
    this.labels.yLabels = this.yVal;

  }
}
</script>


<style lang="scss">
.face-graph {
  width: 250%;
  .vtc {
    height: 250px;
    font-size: 12px;
    @media (min-width: 699px) {
      height: 320px;
    }
  }
  .labels {
    stroke: rgba(0, 0, 0, 0.05);
  }
  .active-line {
    stroke: rgba(0, 0, 0, 0.2);
  }
  .point {
    stroke-width: 2;
    transition: stroke-width 0.2s;
  }
  .point.is-active {
    stroke-width: 5;
  }
  .curve1 {
    .stroke {
      stroke: #00751f;
      stroke-width: 2;
    }
    .fill {
      fill: #00751f;
      opacity: 0.05;
    }
    .point {
      fill: #00751f;
      stroke: #00751f;
    }
  }
  .curve2 {
    .stroke {
      stroke: #960303;
      stroke-width: 2;
    }
    .point {
      fill: #960303;
      stroke: #960303;
    }
  }
  .curve3 {
    .stroke {
      stroke: #0212bf;
      stroke-width: 2;
    }
    .point {
      fill: #0212bf;
      stroke: #0212bf;
    }
  }

  .tooltip {
    &:not(.is-active) {
      display: none;
    }
    padding: 10px;
    background: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    pointer-events: none;
    &-data {
      display: flex;
      &-item {
        display: flex;
        align-items: center;
        &:not(:first-child) {
          margin-left: 20px;
        }
        &:before {
          content: "";
          display: block;
          width: 15px;
          height: 15px;
          margin-right: 5px;
        }
        &--1:before {
          background: #fbac91;
        }
        &--2:before {
          background: #fbe1b6;
        }
        &--3:before {
          background: #7fdfd4;
        }
      }
    }
  }
}
</style>
