import Vue from 'vue'
import Router from 'vue-router'
import ERD from './views/ERD'
import Main from './views/Main'
import NotFound from './views/NotFound'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: Main
    },
    {
      path: '/erd',
      component: ERD
    },
    {
      path: '*',
      component: NotFound
    }
  ]
})
