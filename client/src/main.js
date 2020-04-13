import Vue from 'vue'
import App from './App.vue'
import router from './utils/router'
import store from './utils/store'
import axios from 'axios'

Vue.config.productionTip = false

Vue.prototype.$http = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
})

new Vue({
  render: h => h(App),
  router,
  store,
}).$mount('#app')
