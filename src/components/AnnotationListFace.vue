<template>
    <div>
        <div class="text-color">
                <ul class="annotation">
                  <li v-for="face in vidFaceData" :key="face.frame_idx" class="annotation">
                        <div class="container">
                          <div class="row">
                              <div class="col-sm-6">
                                <img class="img-shot-face" src="./../assets/ph_face.png" alt="face" />
                              </div>
                              <div class="col-sm-6 text-align-right">
                                Face Id: 1<br/>
                                Frame Id: 1<br/>
                                Face Area: 1<br/>
                                Person: Mr. TIB<br/>
                              </div>
                          </div>
                        </div>
                    </li>
                </ul>
        </div>
    </div>
</template>

<script>
//import axios from "axios";
//import Popup from "./Popup";

export default {
  name: "MetadataView",
  annotationType:"shotDetection",
  props: ["type","vidShotData","vidFaceData"],
  facedata:[],
  shotdata:[],
  /* components: {
    Popup
  }, */
  data() {
        return {
            metadata:{title:"Title of teh video",
            duration: 120,
            fps:25,
            source_size:[1080,720]
            }
        }
    },
  methods: {
      onPlayTimeChange() {
        console.log("the time is anchor2: ");
        //console.log(e.target.currentTime);
      }
  }
}   

</script>


<style>
</style>
