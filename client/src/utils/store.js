import Vue from 'vue'
import Vuex from 'vuex'
import api from './connector'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        is_logged_in: '',
        user: {}
    },
    mutations: {
        logged_in(state, user) {
            state.is_logged_in = true
            state.user = user
        },
        logged_out(state) {
            state.is_logged_in = false
            state.user = {}
        }
    },
    actions: {
        login({commit}, user) {
            return new Promise((resolve, reject) => {
                api().post('/login', user)
                .then(response => {
                    let curr_user = response.data.user;

                    commit('logged_in', curr_user)
                    resolve(response);
                })
                .catch(error => {
                    reject(error)
                })
            })
        }
    },
    getters: {

    }
});