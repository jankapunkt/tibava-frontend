import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";
import { defineStore } from "pinia";
import { useTimelineSegmentStore } from "@/store/timeline_segment";
import { useAnnotationCategoryStore } from "@/store/annotation_category";
import { useAnnotationStore } from "@/store/annotation";
import { usePlayerStore } from "@/store/player";

export const useTimelineSegmentAnnotationStore = defineStore(
  "timelineSegmentAnnotation",
  {
    state: () => {
      return {
        timelineSegmentAnnotations: {},
        timelineSegmentAnnotationByTime: new Map(),
        timelineSegmentAnnotationBySegment: new Map(),
        isLoading: false,
      };
    },
    getters: {
      all: (state) => {
        return Object.values(state.timelineSegmentAnnotations);
      },
      transcriptSegments(state) {
        const annotationCatygoryStore = useAnnotationCategoryStore();
        const segmentStore = useTimelineSegmentStore();
        const annotationStore = useAnnotationStore();
        return Object.values(state.timelineSegmentAnnotations).map(
          (segment_annotation, i) => {
            let segment = null;
            let start = 0;
            let end = 0;
            if (segment_annotation.timeline_segment_id) {
              segment = segmentStore.get(segment_annotation.timeline_segment_id);
              if (segment) {
                start = segment.start;
                end = segment.end;
              }
            }
            let annotation = null;
            if (segment_annotation.annotation_id) {
              annotation = annotationStore.get(segment_annotation.annotation_id);
            }
            let cat = null;
            if (annotation) {
              cat = annotationCatygoryStore.get(annotation.category_id);
            }
            let name = '';
            if (annotation) {
              name = annotation.name;
            }
            return { id: i + 1, category: cat, name: name, start: start, end: end };
          }
        ).filter(
          (segment) => segment.category && segment.category.name === "Transcript"
        ).sort(
          (a, b) => a.start > b.start
        ).map(
          (segment, i) => {
            segment.id = i + 1;
            return segment;
          }
        );
      },
      forTimelineSegment(state) {
        return (timelineSegmentId) => {
          if (
            !state.timelineSegmentAnnotationBySegment.has(timelineSegmentId)
          ) {
            return [];
          }
          const timelineSegmentIds =
            state.timelineSegmentAnnotationBySegment.get(timelineSegmentId);
          // console.log(timelineSegmentIds)
          return timelineSegmentIds.map((id) => {
            return state.timelineSegmentAnnotations[id];
          });
        };
      },
      forTimeLUT: (state) => (time) => {
        const timeSecond = Math.round(time);
        if (!state.timelineSegmentAnnotationByTime.has(timeSecond)) {
          return [];
        }
        const timelineSegmentIds =
          state.timelineSegmentAnnotationByTime.get(timeSecond);
        return timelineSegmentIds.map((id) => {
          return state.timelineSegmentAnnotations[id];
        });
      },
    },
    actions: {
      async create({ timelineSegmentId, annotationId }) {
        if (this.isLoading) {
          return;
        }
        this.isLoading = true;

        const params = {
          timeline_segment_id: timelineSegmentId,
          annotation_id: annotationId,
        };

        const timelineSegmentStore = useTimelineSegmentStore();

        return axios
          .post(
            `${config.API_LOCATION}/timeline/segment/annotation/create`,
            params
          )
          .then((res) => {
            if (res.data.status === "ok") {
              this.addToStore([res.data.entry]);
              timelineSegmentStore.addAnnotation([
                { timelineSegmentId, entry: res.data.entry },
              ]);
              return res.data.entry.id;
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
        // .catch((error) => {
        //     const info = { date: Date(), error, origin: 'collection' };
        //     commit('error/update', info, { root: true });
        // });
      },
      async delete(id) {
        if (this.isLoading) {
          return;
        }
        this.isLoading = true;

        const params = {
          timeline_segment_annotation_id: id,
        };

        const timelineSegmentStore = useTimelineSegmentStore();

        return axios
          .post(
            `${config.API_LOCATION}/timeline/segment/annotation/delete`,
            params
          )
          .then((res) => {
            if (res.data.status === "ok") {
              [res.data.entry].forEach((id) => {
                Vue.delete(this.timelineSegmentAnnotations, id);
              });
              timelineSegmentStore.deleteAnnotation([id]);
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
        // .catch((error) => {
        //     const info = { date: Date(), error, origin: 'collection' };
        //     commit('error/update', info, { root: true });
        // });
      },
      async fetchForVideo({ videoId, clear = true }) {
        if (this.isLoading) {
          return;
        }
        this.isLoading = true;

        let params = {};
        if (videoId) {
          params.video_id = videoId;
        } else {
          const playerStore = usePlayerStore();
          const videoId = playerStore.videoId;
          if (videoId) {
            params.video_id = videoId;
          }
        }
        if (clear) {
          this.clearStore();
        }
        return axios
          .get(`${config.API_LOCATION}/timeline/segment/annotation/list`, {
            params,
          })
          .then((res) => {
            if (res.data.status === "ok") {
              this.updateStore(res.data.entries);
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
        // .catch((error) => {
        //     const info = { date: Date(), error, origin: 'collection' };
        //     commit('error/update', info, { root: true });
        // });
      },
      clearStore() {
        this.timelineSegmentAnnotationByTime = new Map();
        this.timelineSegmentAnnotationBySegment = new Map();
        Object.keys(this.timelineSegmentAnnotations).forEach(key => {
          Vue.delete(this.timelineSegmentAnnotations, key);
        });
      },
      deleteFromStore(timelineSegmentAnnotations) {
        timelineSegmentAnnotations.forEach((id) => {
          Vue.delete(this.timelineSegmentAnnotations, id);

          this.timelineSegmentAnnotationByTime.forEach((v, k, m) => {
            let index = v.findIndex((f) => f === id);
            if (index >= 0) {
              v.splice(index, 1);
              m.set(k, v);
            }
          });

          this.timelineSegmentAnnotationBySegment.forEach((v, k, m) => {
            let index = v.findIndex((f) => f === id);
            if (index >= 0) {
              v.splice(index, 1);
              m.set(k, v);
            }
          });
        });
      },
      addToStore(timelineSegmentAnnotations) {
        const timelineSegmentStore = useTimelineSegmentStore();

        timelineSegmentAnnotations.forEach((e) => {
          Vue.set(this.timelineSegmentAnnotations, e.id, e);

          const timelineSegment = timelineSegmentStore.get(
            e.timeline_segment_id
          );
          if (timelineSegment) {
            for (
              var i = Math.floor(timelineSegment.start);
              i < Math.ceil(timelineSegment.end);
              i++
            ) {
              if (this.timelineSegmentAnnotationByTime.has(i)) {
                var ids = this.timelineSegmentAnnotationByTime.get(i);
                ids.push(e.id);
                this.timelineSegmentAnnotationByTime.set(i, ids);
              } else {
                this.timelineSegmentAnnotationByTime.set(i, [e.id]);
              }
            }

            if (
              this.timelineSegmentAnnotationBySegment.has(timelineSegment.id)
            ) {
              let ids = this.timelineSegmentAnnotationBySegment.get(
                timelineSegment.id
              );
              ids.push(e.id);
              this.timelineSegmentAnnotationBySegment.set(
                timelineSegment.id,
                ids
              );
            } else {
              this.timelineSegmentAnnotationBySegment.set(timelineSegment.id, [
                e.id,
              ]);
              console.log("ADD_TO_CACHE")
            }
          }
        });
      },
      updateStore(timelineSegmentAnnotations) {
        const timelineSegmentStore = useTimelineSegmentStore();
        timelineSegmentAnnotations.forEach((e) => {
          if (e.id in this.timelineSegmentAnnotations) {
            return;
          }
          Vue.set(this.timelineSegmentAnnotations, e.id, e);

          const timelineSegment = timelineSegmentStore.get(
            e.timeline_segment_id
          );
          if (timelineSegment) {
            for (
              var i = Math.floor(timelineSegment.start);
              i < Math.ceil(timelineSegment.end);
              i++
            ) {
              if (this.timelineSegmentAnnotationByTime.has(i)) {
                var ids = this.timelineSegmentAnnotationByTime.get(i);
                ids.push(e.id);
                this.timelineSegmentAnnotationByTime.set(i, ids);
              } else {
                this.timelineSegmentAnnotationByTime.set(i, [e.id]);
              }
            }
            if (
              this.timelineSegmentAnnotationBySegment.has(timelineSegment.id)
            ) {
              let ids = this.timelineSegmentAnnotationBySegment.get(
                timelineSegment.id
              );
              ids.push(e.id);
              this.timelineSegmentAnnotationBySegment.set(
                timelineSegment.id,
                ids
              );
            } else {
              this.timelineSegmentAnnotationBySegment.set(timelineSegment.id, [
                e.id,
              ]);
            }
          }
        });
      },
    },
  }
);
