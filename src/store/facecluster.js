import config from "../../app.config";
import axios from "../plugins/axios";
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
      
      state.current_clustering = face_clustering.at(0); // use latest face_clustering

      // if there is more than one face_clustering result for this video, delete all the 'old' ones to preserve memory
      if (face_clustering.length > 1) {
        if (state.isLoading) {
          return [];
        }
        state.isLoading = true;

        let plugin_list = [];

        face_clustering = face_clustering.slice(1)

        face_clustering.forEach((item) => plugin_list.push(item.id));
        
        if(plugin_list.length > 1){
          let params = {
            plugin_list: plugin_list
          }

          axios.post(`${config.API_LOCATION}/plugin/run/delete`, params)
          .then((res) => {
              if (res.data.status !== "ok") {
                  console.log("Error in plugin/run/delete");
                  console.log(res.data);
              }else{
                pluginRunStore.delete(plugin_list);
                pluginRunResultStore.deleteForPluginRuns(plugin_list);
              }
          })
          .finally(() => {
              state.isLoading = false;
          });
        }
      }
      let results = [];

      if(!state.current_clustering.results[0]){
        return [];
      }

      results = state.current_clustering.results[0].data.cluster
      .sort( 
        // bigger clusters should come first
        (a, b) => b.object_refs.length - a.object_refs.length
      ).map((cluster, index) => {
        return {
          id: index + 1,
          clustering_data_id: state.current_clustering.results[0].data_id,
          systemId: cluster.id,
          cluster: cluster,
          timestamps: Array.from(cluster.object_refs.map((face_ref) => {
            let timestamp =  state.current_clustering.results[0].data.kpss.find(kps => kps.ref_id == face_ref);
            return timestamp.time;
          }))
        }
      })

      return results;
    }
  }, 
  actions: {
    getFilteredFaceRefs (deletedFaces, cluster_id) {
          let current_cluster_object_refs = this.current_clustering.results[0].data.cluster
          .filter((cluster) => cluster.id == cluster_id)[0].object_refs;

          if (deletedFaces.length > 0){
            current_cluster_object_refs = current_cluster_object_refs
            .filter((ref) => !deletedFaces.includes(ref));
          }

          return current_cluster_object_refs.map((ref) => this.faceRefDict[ref]);
    },
  }
},);
