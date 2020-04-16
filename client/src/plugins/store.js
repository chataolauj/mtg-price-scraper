import Vue from 'vue'
import Vuex from 'vuex'
import { http } from './connector'

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        logged_in: '',
        user: {}
    },
    mutations: {
        logged_in(state, user) {
            state.logged_in = true;
            state.user = user;
        },
        logged_out(state) {
            state.logged_in = false;
            state.user = {};
        }
    },
    actions: {
        register({commit}, register_creds) {
            return new Promise((resolve, reject) => {
                http.post('/register', register_creds)
                .then(response => {
                    let curr_user = response.data.user;

                    commit('logged_in', curr_user)
                    resolve(response);
                })
                .catch(error => {
                    let register_error = '';

                    switch(error.response.status) {
                        case 422:
                            register_error = error.response.data;
                            break;
                        case 409:
                            register_error = error.response.data.error;
                            break;
                        default:
                            register_error = ''
                    }

                    reject(register_error);
                });
            });
        },
        login({commit}, user) {
            return new Promise((resolve, reject) => {
                http.post('/login', user)
                .then(response => {
                    let curr_user = response.data.user;

                    commit('logged_in', curr_user)
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },
        logout({commit}) {
            return new Promise((resolve, reject) => {
                http.get('/logout')
                .then(response => {
                    commit('logged_out');

                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },
        check_auth({commit}) {
            return new Promise((resolve, reject) => {
                http.get('/check_auth')
                .then(response => {
                    let curr_user = response.data.user;

                    commit('logged_in', curr_user)
                    resolve(response);
                })
                .catch(error => {
                    commit('logged_out')
                    reject(error);
                });
            });
        }
    },
    getters: {

    }
});

export default store;