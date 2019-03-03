import Vue from 'vue'
import Router from 'vue-router'
import ERD from './views/ERD'
import Main from './views/Main'
import NotFound from './views/NotFound'

Vue.use(Router)

const router = new Router({
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

router.afterEach((to, from) => {
  // 기본 레이아웃 활성화
  if (to.path !== '/erd') {
    Vue.prototype.$event.$emit('App_layout', {
      isLayout: true
    })
  }
})

export default router
