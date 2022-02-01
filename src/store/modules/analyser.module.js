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
    analyser: {},
  },
  actions: {
    list({ commit }, params) {
      axios.get(`${config.API_LOCATION}/analyser_list`)
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
  },
  mutations: {
    update(state, analyser){
      console.log(`Mutate current analyser ${JSON.stringify(analyser)}`);
      state.analyser=analyser;
    },
  },
};
export default api;