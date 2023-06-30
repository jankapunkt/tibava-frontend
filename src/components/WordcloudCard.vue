<template>
  <v-card
    :items="transcripts"
    width ="500"
    height="500">
    <div ref="wordcloudContainer" class="wordcloud-container"></div>
  </v-card>
</template>

<script>
import TimeMixin from "../mixins/time";
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { mapStores } from "pinia";
import { useTimelineSegmentAnnotationStore } from "@/store/timeline_segment_annotation";

export default {
  mixins: [TimeMixin],
  data() {
    return {
      layout: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.createWordCloud();
    });
  },
  methods: {
    createWordCloud() {
      const all_words = [];
      for (var transcript of this.transcripts){
        for (var word of transcript.name.split(" ")){
          all_words.push(word);
        }
      }
      const words = all_words.map(word => ({
        text: word,
      }));
      // console.log(">>>>>>>>>>>");
      // console.log(words);
      this.layout = cloud()
        .size([500, 500])
        .words(words)
        .padding(10)
        .fontSize(30)
        .on('end', this.drawWordCloud);

      this.layout.start();
    },
    drawWordCloud(words) {
      d3.select(this.$refs.wordcloudContainer)
        .append('svg')
        .append("g")
      .attr("transform", "translate(" + this.layout.size()[0] / 2 + "," + this.layout.size()[1] / 2 + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
}
  },
  computed: {
    transcripts() {
      return this.timelineSegmentAnnotationStore.transcriptSegments;
    },
    ...mapStores(useTimelineSegmentAnnotationStore),
  }
};
</script>
