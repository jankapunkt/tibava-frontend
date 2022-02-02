import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

function generateRandomStr(length) {
    var result = [];
    var characters = 'abcdef0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}
const api = {
    namespaced: true,
    state: {
        timelines: [],
    },
    actions: {
        list({ commit }, video_hash_id) {
            const params = {
                hash_id: video_hash_id
            }
            axios.get(`${config.API_LOCATION}/timeline_list`, { params })
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('update', res.data.entries);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'collection' };
                    commit('error/update', info, { root: true });
                });
        },

        duplicate({ commit }, timeline_hash_id) {
            
            axios.post(`${config.API_LOCATION}/timeline_duplicate`, { timeline_hash_id })
              .then((res) => {
                console.log(res);
                if (res.data.status === 'ok') {
                    commit('duplicate', timeline_hash_id, res.data.hash_id);
                }
              })
              .catch((error) => {
                const info = { date: Date(), error, origin: 'upload' };
                commit('error/update', info, { root: true });
              });
          },

        delete({ commit }, timeline_hash_id) {
            axios.post(`${config.API_LOCATION}/timeline_delete`, { hash_id: timeline_hash_id })
            .then((res) => {
                if (res.data.status === 'ok') {
                commit("delete",timeline_hash_id);
                }
            })
            .catch((error) => {
                const info = { date: Date(), error, origin: 'collection' };
                commit('error/update', info, { root: true });
            });
        },
    },
    mutations: {
        duplicate(state, old_timeline_hash_id, new_timeline_hash_id) {
            timeline_index = state.timelines.findIndex(e => e.hash_id === old_timeline_hash_id);
            state.timelines.push(state.timelines[timeline_index]);
        },
        update(state, timelines) {
            state.timelines = timelines;
        },
        delete(state, timeline_hash_id){
            timeline_index = state.timelines.findIndex(e => e.hash_id === timeline_hash_id);
            state.timelines.splice(timeline_index, 1);
        },
    },
};
export default api;