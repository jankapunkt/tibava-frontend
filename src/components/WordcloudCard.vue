<template>
  <v-card>
    <span style="color:rgb(0, 0, 0); margin-bottom:0.5cm">{{ get_timecode(transcript.start, 0) }}</span>
    <div ref="wordcloudContainer" class="wordcloud-container"></div>
  </v-card>
</template>

<script>
import TimeMixin from "../mixins/time";
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { mapStores } from "pinia";
import { usePlayerStore } from "@/store/player";

export default {
  mixins: [TimeMixin],
  props: ["transcript"],
  data() {
    return {
      emitted: false,
      layout: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.createWordCloud();
    });
  },
  methods: {
    setVideoPlayerTime(time) {
      this.playerStore.setTargetTime(time);
    },
    createWordCloud() {
      const words = this.transcript.name.split(" ").map(word => ({
        text: word,
      }));
      console.log(">>>>>>>>>>>");
      console.log(words);
      this.layout = cloud()
        .size([500, 140])
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
    isHighlighted() {
      const cur_time = this.playerStore.currentTime;
      if (this.transcript.start <= cur_time && this.transcript.end > cur_time) {
        if (!this.emitted && this.syncTime) {
          this.$emit('childHighlighted', this.transcript.id);
        }
        this.emitted = true;
        return true;
      }
      this.emitted = false;
      return false;
    },
    time() {
      return this.playerStore.currentTime;
    },
    syncTime() {
      return this.playerStore.syncTime;
    },
    ...mapStores(usePlayerStore),
  }
};
</script>

<style>
.highlighted {
  background-color: rgba(43, 24, 27, 0.287) !important;
}
.v-tooltip__content {
  max-width: 400px; /* Set your desired maximum width */
}
</style>
