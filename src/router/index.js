import Vue from 'vue'
import Router from 'vue-router'
import ERD from '@/components/editor/ERD'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'ERD',
      component: ERD
    }
  ]
})
