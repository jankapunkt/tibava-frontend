import config from "../../app.config";
import { defineStore } from "pinia";
import { usePlayerStore } from "./player";
import { usePluginRunStore } from "./plugin_run";
import { usePluginRunResultStore } from "./plugin_run_result";

export const useFaceclusterStore = defineStore("facecluster", {
  state: () => {
    return {
      current_clustering: null,
      isLoading: false,
      faceRefDict: {},
    };
  },
  getters: {
    clusters (state) {
      console.log("Loading face_clusterings");
      
      if(!this.getCurrentClustering()){
        return []
      }

      // console.log(this.current_clustering);

      let results = [];

      results = this.current_clustering.results[0].data.facecluster
      .sort( 
        // bigger clusters should come first
        (a, b) => b.face_refs.length - a.face_refs.length
      ).map((cluster, index) => {
        return {
          id: index + 1,
          clustering_data_id: this.current_clustering.results[0].data_id,
          systemId: cluster.id,
          facecluster: cluster,
          timestamps: Array.from(cluster.face_refs.map((face_ref) => {
            let timestamp =  this.current_clustering.results[0].data.kpss.find(kps => kps.ref_id == face_ref);
            return timestamp.time;
          }))
        }
      })
      // console.log(results);
      return results;
    }
  }, 
  actions: {
    getFilteredFaceRefs (deletedFaces, cluster_id) {
          this.getCurrentClustering();

          let current_cluster_face_refs = this.current_clustering.results[0].data.facecluster
          .filter((cluster) => cluster.id == cluster_id)[0].face_refs;

          if (deletedFaces.length > 0){
            current_cluster_face_refs = current_cluster_face_refs
            .filter((ref) => !deletedFaces.includes(ref));
          }

          return current_cluster_face_refs.map((ref) => this.faceRefDict[ref]);
    },
    getCurrentClustering() {
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
        return false;
      }

      this.current_clustering = face_clustering.at(0); // use latest face_clustering

      return true;
    }
  }
},);
