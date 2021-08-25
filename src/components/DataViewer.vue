<template>
    <div>
        <h2 class="text-color pd-player-tittle"></h2>
    </div>
</template>

<script>
//import axios from "axios";

export default {
  name: "DataViewer",
  data() {  
        return {
            faceClustering:[{"cluster_id": 26, "face_ids": [0, 10, 12, 14, 18, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 591, 597, 618, 621], "frame_ids": [39, 157, 158, 159, 161, 762, 763, 764, 765, 766, 767, 768, 769, 770, 771, 772, 773, 774, 775, 776, 777, 777, 778, 779, 780, 982, 984, 994, 995], "occurrences": 29,"color":[Math.floor((Math.random() * 130) + 130),Math.floor((Math.random() * 130) + 130),Math.floor((Math.random() * 130) + 130)]},
{"cluster_id": 9, "face_ids": [1], "frame_ids": [118], "occurrences": 1,"color":[Math.floor((Math.random() * 130) + 130),Math.floor((Math.random() * 130) + 130),Math.floor((Math.random() * 130) + 130)]}],
            faceDetection:null,
            successStatus:200, 
            dbServerLink:"http://localhost:5888/",
            curVidShotData:[{end_frame: 71, end_time: "00:00:02.958",shot_id: 0,start_frame: 0,start_time: "00:00:00.000",  }]
        }
  },
  created: function() {
        this.$root.$refs.DataViewer = this;
    },
  methods: {
  }
}
</script>


<style>
</style>
