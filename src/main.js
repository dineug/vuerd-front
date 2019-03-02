import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import './js/fontawesome'

Vue.use(Vuetify)
Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.$event = new Vue()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
