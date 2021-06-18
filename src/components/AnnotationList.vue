<template>
    <div>
        <div class="text-color">
                <ul v-if="type == 'typeShots'" class="annotation">
                  <li v-for="shot in vidShotData" class="annotation" :key="shot.shot_id" :id="'shot_anno_list_'+shot.shot_id">
                    <div class="container border-container">
                      <div class="row">
                        <div class="col-sm-4">
                          Shot # {{shot.shot_id}}
                        </div>
                        <div class="col-sm-8 text-align-right">
                          Id: {{shot.shot_id}}<br/>
                          Time: {{shot.start_time.slice(3,8)}} - {{shot.end_time.slice(3,8)}}<br/>
                          Frame Span: {{shot.start_frame}} - {{shot.end_frame}}<br/>
                          Duration: 10 sec<br/>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-sm-4">
                          <img :id="'shot_'+shot.shot_id+'_frame_0'" class="img-shot-frame" src="./../assets/ph_shot_start.png" alt="starting" />
                        </div>
                        <div class="col-sm-4">
                          <img :id="'shot_'+shot.shot_id+'_frame_1'" class="img-shot-frame" src="./../assets/ph_shot_middle.png" alt="middle" />
                        </div>
                        <div class="col-sm-4">
                          <img :id="'shot_'+shot.shot_id+'_frame_2'" class="img-shot-frame" src="./../assets/ph_shot_end.png" alt="ending" />
                        </div>
                      </div>
                    </div>
                    <hr class="border-hr">
                  </li>
                </ul>
                <ul v-else class="annotation">
                  <li v-for="(face,index) in vidFaceData" :key="index" class="annotation">
                        <div class="container">
                          <div class="row">
                              <div class="col-sm-6">
                                <img class="img-shot-face" src="./../assets/ph_face.png" alt="face" />
                              </div>
                              <div class="col-sm-6 text-align-right">
                                Face Id: 1<br/>
                                Frame Id: {{face.frame_idx}}<br/>
                                Face Area: {{face.bbox_area.toFixed(4)}}<br/>
                                Person: Mr. TIB<br/>
                              </div>
                          </div>
                        </div>
                        <hr class="border-hr">
                    </li>
                </ul>
        </div>
    </div>
</template>
<script>

export default {
  name: "AnnotationListView",
  annotationType:"shotDetection",
  props: ["type","vidShotData","vidFaceData"],
  facedata:[],
  shotdata:[],
  created: function() {
        this.$root.$refs.AnnotationListView = this;
    },
  data() {
        return {
            metadata:{title:"Title of teh video",
            duration: 120,
            fps:25,
            source_size:[1080,720],
            faceCounter:1,
            },
        }
    },
  methods: {
    onPlayTimeChange() {
    }
    },
    updated: function() {
      for(var i=0;i<this.vidShotData.length;i++){
        for(var j=0;j<this.vidShotData[i].keyframes.length;j++){
          document.getElementById("shot_"+i+"_frame_"+j).src="data:image/jpg;base64,"+this.vidShotData[i].keyframes[j];
        }
      }
    }
}   

</script>


<style>
</style>
