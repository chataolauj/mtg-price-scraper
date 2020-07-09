import Vue from 'vue'
import App from './App.vue'
import router from './plugins/router'
import store from './plugins/store'
import axios from 'axios'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

const port = process.env.PORT || 5000;

Vue.prototype.$http = axios.create({
  baseURL: port,
  withCredentials: true
});

new Vue({
  render: h => h(App),
  router,
  vuetify,
  store
}).$mount('#app')
