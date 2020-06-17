import Vue from 'vue'
import Vuex from 'vuex'
import { http } from './connector'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex);

const vuexLocal = new VuexPersist({
    key: 'vuex',
    storage: window.localStorage
});

const store = new Vuex.Store({
    plugins: [vuexLocal.plugin],
    state: {
        logged_in: '',
        email: '',
        app_bar: {
            color: 'white',
            isFlat: true
        },
        card: {}
    },
    mutations: {
        logged_in(state, email) {
            state.logged_in = true;
            state.email = email;
        },
        logged_out(state) {
            state.logged_in = false;
            state.email = '';
        },
        change_app_bar(state, app_bar) {
            state.app_bar = app_bar;
        },
        scraped_card(state, card) {
            state.card = card;
        },
        change_email(state, new_email) {
            state.email = new_email;
        }
    },
    actions: {
        register({commit}, register_creds) {
            return new Promise((resolve, reject) => {
                http.post('/register', register_creds)
                .then(response => {
                    let email = response.data.email;

                    commit('logged_in', email)
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
        login({commit}, email) {
            return new Promise((resolve, reject) => {
                http.post('/login', email)
                .then(response => {
                    let curr_email = response.data.email;

                    commit('logged_in', curr_email)
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
                    let email = response.data.email;

                    commit('logged_in', email)
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