import axios from "../plugins/axios";
import config from "../../app.config";
import { defineStore } from "pinia";
import { useTimelineSegmentStore } from "@/store/timeline_segment";
import { useAnnotationCategoryStore } from "@/store/annotation_category";
import { useAnnotationStore } from "@/store/annotation";

export const useTimelineSegmentAnnotationStore = defineStore(
  "timelineSegmentAnnotation",
  {
    state: () => {
      return {
        timelineSegmentAnnotations: {},
        timelineSegmentAnnotationByTime: new Map(),
        timelineSegmentAnnotationBySegment: new Map(),
        timelineSegmentAnnotationList: [],

        timelineSegmentAnnotationListAdded: [],
        timelineSegmentAnnotationListDeleted: [],
        isLoading: false,
      };
    },
    getters: {
      all: (state) => {
        return state.timelineSegmentAnnotationList.map(
          (id) => state.timelineSegmentAnnotations[id]
        );
      },
      transcriptSegments(state) {
        const annotationCatygoryStore = useAnnotationCategoryStore();
        const segmentStore = useTimelineSegmentStore();
        const annotationStore = useAnnotationStore();
        return state.timelineSegmentAnnotationList.map(
          (id, i) => {
            const segment_annotation = state.timelineSegmentAnnotations[id];
            // console.log(JSON.stringify(segment_annotation));

            let segment = null;
            let start = 0;
            let end = 0;
            if (segment_annotation.timeline_segment_id) {
              segment = segmentStore.get(segment_annotation.timeline_segment_id);
              start = segment.start;
              end = segment.end;
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
          console.log('QUERY')
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
              [res.data.entry].forEach((id, i) => {
                let index = state.timelineSegmentAnnotationList.findIndex(
                  (f) => f === id
                );
                state.timelineSegmentAnnotationList.splice(index, 1);
                delete state.timelineSegmentAnnotations[id];
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
        this.timelineSegmentAnnotationListAdded = [];
        this.timelineSegmentAnnotationListDeleted = [];
        this.timelineSegmentAnnotations = {};
        this.timelineSegmentAnnotationList = [];
      },
      deleteFromStore(timelineSegmentAnnotations) {
        timelineSegmentAnnotations.forEach((id, i) => {
          this.timelineSegmentAnnotationListDeleted.push(id);
          let index = this.timelineSegmentAnnotationList.findIndex(
            (f) => f === id
          );
          this.timelineSegmentAnnotationList.splice(index, 1);
          delete this.timelineSegmentAnnotations[id];

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
        // console.log('+w+wür+wqrüwq+rüwq+ü')
        // console.log(JSON.stringify(timelineSegmentAnnotations))

        timelineSegmentAnnotations.forEach((e, i) => {
          this.timelineSegmentAnnotationListAdded.push(e.id);
          this.timelineSegmentAnnotations[e.id] = e;
          this.timelineSegmentAnnotationList.push(e.id);

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
              var ids = this.timelineSegmentAnnotationBySegment.get(
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
        timelineSegmentAnnotations.forEach((e, i) => {
          if (e.id in this.timelineSegmentAnnotations) {
            return;
          }
          this.timelineSegmentAnnotationListAdded.push(e.id);
          this.timelineSegmentAnnotations[e.id] = e;
          this.timelineSegmentAnnotationList.push(e.id);

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
              var ids = this.timelineSegmentAnnotationBySegment.get(
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
