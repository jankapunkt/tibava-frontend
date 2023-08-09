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
      this.getCurrentClustering();

      let results = [];

      results = this.current_clustering.results[0].data.facecluster
      .map((cluster, index) => {
        return {
          embedding_index: index,
          systemId: cluster.id,
          facecluster: cluster,
          embedding_ref: this.current_clustering.results[1].data_id,
          face_refs: cluster.face_refs,
          image_paths: Array.from(cluster.face_refs.map((face_ref) => {
            let img_dict = this.current_clustering.results[0].data.images.find(image => image.ref_id == face_ref);
            return config.THUMBNAIL_LOCATION + `/${img_dict.id.substr(0, 2)}/${img_dict.id.substr(2, 2)}/${img_dict.id}.${img_dict.ext}`
          })),
          timestamps: Array.from(cluster.face_refs.map((face_ref) => {
            let timestamp =  this.current_clustering.results[0].data.kpss.find(kps => kps.ref_id == face_ref);
            return timestamp.time;
          }))
        }
      })
      .sort( 
        // bigger clusters should come first
        (a, b) => b.image_paths.length - a.image_paths.length
      ).map((cluster, index) => ({
        // add an index that resembles the clusters sorted by length
        ...cluster,
        id: index + 1,
      }))

      this.faceRefDict = {};
      results.forEach((cluster) => {
        cluster.face_refs.forEach((face_ref, index) => {
          this.faceRefDict[face_ref] = cluster.image_paths[index];
        });
      });

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
        return [];
      }

      this.current_clustering = face_clustering.at(0); // use latest face_clustering
    }
  }
},);
