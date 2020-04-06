import Vue from 'vue'
import App from './App.vue'
import router from './utils/router'
import store from './utils/store'
import axios from 'axios'

Vue.config.productionTip = false

Vue.prototype.$axios = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
})

//check if logged in
//if logged in then commit('logged_in', response.data.user)
/* store.dispatch('check_auth')
.then(response => {
  console.log(response);
})
.catch(error => {
  console.log(error.response.data.message);
}); */

new Vue({
  render: h => h(App),
  router,
  store,
}).$mount('#app')
