import Vue from 'vue'
import Router from 'vue-router'
import ERD from './views/ERD.vue'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'ERD',
      component: ERD
    }
  ]
})
