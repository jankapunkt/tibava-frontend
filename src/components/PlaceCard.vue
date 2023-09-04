<template>
  <v-card :class="['d-flex', 'flex-column', 'pa-2', 'ma-4']" elevation="4" :loading="loading">
    <v-row no-gutters align="center" class="px-2 py-0">
      <v-col cols="3">
        <v-list-item-content min-width>
          <div style="font-size: 16px;"> {{ name }}
            <v-dialog v-model="show" max-width="1000">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" @click="show = true" icon size="16">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>

              <v-card>
                <v-card-title class="mb-2">
                  {{ $t("modal.timeline.rename.title") }}
                  <v-btn icon @click.native="show = false" absolute top right>
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-text-field :label="$t('modal.timeline.rename.name')" prepend-icon="mdi-pencil"
                    v-model="name"></v-text-field>
                </v-card-text>
                <v-card-actions class="pt-0">
                  <v-btn class="mr-4" @click="renameCluster" :disabled="renaming || !name">
                    {{ $t("modal.timeline.rename.update") }}
                  </v-btn>
                  <v-btn @click="show = false">{{
                    $t("modal.timeline.rename.close")
                  }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

          </div>
          <v-list-item-subtitle>Places: {{ cluster.cluster.object_refs.length }}</v-list-item-subtitle>
          <v-list-item-subtitle>First: {{ cluster.timestamps[0] }} sec</v-list-item-subtitle>
          <v-list-item-subtitle>Last: {{ cluster.timestamps[cluster.timestamps.length - 1] }} sec</v-list-item-subtitle>
        </v-list-item-content>
      </v-col>

      <v-col cols="8" style="width: 100%">
        <div class="image-container"
          style="width: 100%; gap: 10px; overflow-x: auto; justify-content: flex-start; display:flex; flex-direction: row;">
          <v-img v-for="(item, i) in this.cluster_thumbnails" :key="i" :src="item" contain
            style="cursor: pointer; height: 100px; max-width: 100px;" @click="goToPlace(i)"></v-img>
        </div>
      </v-col>

      <v-col align="end" cols="1">
        <v-menu v-model="showDotMenu" bottom right>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small>
              <v-icon v-bind="attrs" v-on="on">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <ClusterExploration :cluster="this.cluster" :isFaceCluster="false" @deleteCluster="deleteCluster"
                @update="fill_thumbnails">
              </ClusterExploration>
            </v-list-item>
            <v-list-item>
              <v-tooltip :disabled="!toTimelineDisabled" left>
                <template v-slot:activator="{ on }">
                  <div v-on="on" class="d-inline-block">
                    <v-btn :disabled="toTimelineDisabled" text @click="createTimeline" v-on="on">
                      <v-icon left>{{ "mdi-barcode" }}</v-icon>
                      {{ $t("button.totimeline") }}
                    </v-btn>
                  </div>
                </template>
                A timeline for this Cluster already exists. Delete it before you create another one.
              </v-tooltip>
            </v-list-item>
            <v-list-item>
              <v-btn text @click="deleteCluster">
                <v-icon left>{{ "mdi-trash-can-outline" }}</v-icon>{{
                  $t("button.deleteCluster") }}
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <span style="font-size: 16px; margin-left: 1%;" class="mb-2">
      <i>Majority Labels: {{ max_labels }} </i>
    </span>
  </v-card>
</template>

<script>
import TimeMixin from "../mixins/time";

import { mapStores } from "pinia";
import { usePlayerStore } from "@/store/player";
import { useClusterTimelineItemStore } from "@/store/cluster_timeline_item";
import { useTimelineStore } from "@/store/timeline";
import { usePluginRunStore } from "@/store/plugin_run";
import { usePlaceclusterStore } from "@/store/placecluster";
import { usePlaceStore } from "../store/place";
import { cluster } from "d3";
import ClusterExploration from "@/components/ClusterExploration.vue";

export default {
  mixins: [TimeMixin],
  props: ["cluster"],
  data() {
    return {
      // card shows loading animation while the faceidentification plugin runs
      loading: false,
      show: false,
      renaming: false, // during renaming, we do not want to create new ClusterTimelineItems in the watcher
      nameProxy: "Cluster " + String(this.cluster.id),
      cluster_thumbnails: [],
      thumbnail_ids: [],
      isSubmitting: false,
      showDotMenu: false,
      toTimelineDisabled: false,
    }
  },
  mounted() {
    this.fill_thumbnails();
    this.toTimelineDisabled = this.clusterTimelineItemStore.hasTimeline(this.cluster.systemId);
  },
  methods: {
    fill_thumbnails() {
      const placeStore = usePlaceStore();
      const remainingPlaces = placeStore.getImagePaths(this.cluster);
      if (remainingPlaces) {
        this.cluster_thumbnails = [remainingPlaces.at(0)];
        this.thumbnail_ids = [0];

        if (remainingPlaces.length > 2) {
          this.cluster_thumbnails.push(remainingPlaces.at(remainingPlaces.length / 4));
          this.thumbnail_ids.push(remainingPlaces.length / 4)
        }

        if (remainingPlaces.length > 3) {
          this.cluster_thumbnails.push(remainingPlaces.at(3 * remainingPlaces.length / 4));
          this.thumbnail_ids.push(3 * remainingPlaces.length / 4)
        }

        if (remainingPlaces.length > 1) {
          this.cluster_thumbnails.push(remainingPlaces.at(-1));
          this.thumbnail_ids.push(remainingPlaces.length - 1)
        }
      }

      if (this.showDotMenu) {
        this.showDotMenu = false;
      }

    },
    async renameCluster() {
      if (this.renaming) {
        return;
      }
      this.renaming = true;

      if (this.clusterTimelineItemStore.hasTimeline(this.cluster.systemId)) {
        var timelineId = this.clusterTimelineItemStore.getTimeline(this.cluster.systemId);
        if (timelineId) {
          await this.timelineStore.rename({
            timelineId: timelineId,
            name: this.nameProxy,
          });
        }
      }

      if (this.clusterTimelineItemStore.getID(this.cluster.systemId) !== -1) {
        await this.clusterTimelineItemStore.rename({
          cluster_id: this.cluster.systemId,
          name: this.nameProxy,
        });

      }
      else { //for some reason, this cluster has no CTI, so we create it
        await this.clusterTimelineItemStore.create({ cluster_id: this.cluster.systemId, name: this.nameProxy, video_id: usePlayerStore().videoId });
      }


      this.renaming = false;
      this.show = false;
    },
    async deleteCluster() {
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;

      // remove cluster from store
      await this.clusterTimelineItemStore.delete(this.cluster.systemId);
      // delete this card
      this.$emit("childDeleted", this.cluster.systemId);
      this.isSubmitting = false;
      this.show = false;
      this.showDotMenu = false;

    },
    async createTimeline() {
      this.loading = true;
      let parameters = [
        {
          name: "timeline",
          value: this.name,
        },
      ];

      // create a list of indices that resemble the images of the cluster that are not deleted yet
      let index_list = usePlaceStore().getIndexList(this.cluster);

      parameters = parameters.concat(
        [
          {
            name: "fps",
            value: 2,
          },
          {
            name: "embedding_ref",
            value: this.cluster.clustering_data_id,
          },
          {
            name: "cluster_id",
            value: this.cluster.systemId,
          },
          {
            name: "index",
            value: String(index_list),
          }
        ]
      );

      parameters = parameters.map((e) => {
        if ("file" in e) {
          return { name: e.name, file: e.file };
        } else {
          return { name: e.name, value: e.value };
        }
      });

      this.pluginRunStore
        .submit({ plugin: "place_indentification", parameters: parameters })
        .then(() => {
          this.loading = false;
        });


    },
    goToPlace(index) {
      const time = this.cluster.timestamps[Math.round(this.thumbnail_ids[index])];
      this.playerStore.setTargetTime(time);
    },
    mostFrequentString(arr) {
      return arr.sort((a, b) =>
        arr.filter(v => v === a).length
        - arr.filter(v => v === b).length
      ).pop();
    }
  },
  computed: {
    name: {
      get() {
        const clusterTimelineItemStore = useClusterTimelineItemStore();
        return clusterTimelineItemStore.getName(this.cluster.systemId);
      },
      set(val) {
        this.nameProxy = val;
      },
    },
    max_labels() {
      return this.mostFrequentString(this.cluster.place365classes) + " | " + this.mostFrequentString(this.cluster.place16classes) + " | " + this.mostFrequentString(this.cluster.place3classes)
    },

    syncTime() {
      return this.playerStore.syncTime;
    },
    timelines() {
      return this.timelineStore.all;
    },
    ...mapStores(usePlayerStore, usePluginRunStore, useClusterTimelineItemStore, useTimelineStore, usePlaceclusterStore),
  },
  watch: {
    timelines(values) {
      this.toTimelineDisabled = this.clusterTimelineItemStore.hasTimeline(this.cluster.systemId);
      if (values.length == 0 || this.renaming) {
        return;
      }

      const newTimeline = this.timelineStore.getLatest();

      // make sure this is the right card
      if (newTimeline.name != this.nameProxy) {
        return;
      }

      this.clusterTimelineItemStore.setTimeline(this.cluster.systemId, newTimeline.id);
      this.toTimelineDisabled = true;
    }
  },
  components: {
    ClusterExploration,
  },
};
</script>

<style>
.image-contaniner {
  overflow-x: auto;
  white-space: nowrap;
  justify-content: flex-start;
  gap: 10px;
}
</style>