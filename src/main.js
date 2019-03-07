import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './js/fontawesome'

Vue.config.productionTip = false
Vue.prototype.$event = new Vue()

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
