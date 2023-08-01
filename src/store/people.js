import config from "../../app.config";
import { defineStore } from "pinia";
import axios from "../plugins/axios";
import { usePlayerStore } from "./player";
import { usePluginRunStore } from "./plugin_run";
import { usePluginRunResultStore } from "./plugin_run_result";
import { useClusterTimelineItemStore } from "./cluster_timeline_item";

export const usePeopleStore = defineStore("people", {
  state: () => {
    return {
      current_clustering: null,
      isLoading: false,
    };
  },
  getters: {
    clusters (state) {
      const pluginRunStore = usePluginRunStore();
      const pluginRunResultStore = usePluginRunResultStore();
      const playerStore = usePlayerStore();

      // selection of timeline to be used for the thumbnails
      let face_clustering = pluginRunStore
        .forVideo(playerStore.videoId)
        .filter((e) => {
          return e.type == "face_clustering" && e.status == "DONE";
        })
        .map((e) => {
          e.results = pluginRunResultStore.forPluginRun(e.id);
          return e;
        })
        .sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        })
      ;

      if (!face_clustering.length) {
        return [];
      }

      this.current_clustering = face_clustering.at(0); // use latest face_clustering

      let results = [];
      
      results = this.current_clustering.results[0].data.facecluster
      .map((cluster, index) => {
        return {
          embedding_index: index,
          systemId: cluster.id,
          facecluster: cluster,
          embedding_ref: this.current_clustering.results[1].data_id,
          image_paths: Array.from(cluster.face_refs.map((face_ref) => {
            let img_dict = this.current_clustering.results[0].data.images.find(image => image.ref_id == face_ref);
            return config.THUMBNAIL_LOCATION + `/${img_dict.id.substr(0, 2)}/${img_dict.id.substr(2, 2)}/${img_dict.id}.${img_dict.ext}`
          })),
          timestamps: Array.from(cluster.face_refs.map((face_ref) => {
            let timestamp =  this.current_clustering.results[0].data.kpss.find(kps => kps.ref_id == face_ref);
            return timestamp.time;
          }))
        };
      })
      .sort( 
        // bigger clusters should come first
        (a, b) => b.image_paths.length - a.image_paths.length
      ).map((cluster, index) => ({
        ...cluster,
        id: index + 1,
      }))

      // console.log("results");
      // console.log(results);

      return results;
 
    }
  },
  actions: {
    async connectToTimeline (cluster_id, timeline_id, new_name) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = {
        cluster_id: cluster_id,
        timeline_id: timeline_id,
        name: new_name,
      };
      
      return axios
        .post(`${config.API_LOCATION}/clusterTimelineItem/create`, params)
        .then((res) => {
          const clusterTimelineStore = useClusterTimelineItemStore();
          clusterTimelineStore.addToStore(res.data.entry);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  },
  },
);
