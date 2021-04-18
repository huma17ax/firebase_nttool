import Vue from 'vue'
import Router from 'vue-router'
import Chat from '@/components/Chat'
import Setting from '@/components/Setting'
import Home from '@/components/Home'
import Manage from '@/components/Manage'
import store from '@/store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/chat',
      name: 'Chat',
      component: Chat
    },
    {
      path: '/setting',
      name: 'Setting',
      component: Setting
    },
    {
      path: '/manage',
      name: 'Manage',
      component: Manage
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'Home' && store.state.status.groupName) {
    next({path: from.path})
  } else if (to.name !== 'Home' && !store.state.status.groupName) {
    next({path: '/'})
  } else {
    store.commit('status/setPageTransition', {state: true})
    setTimeout(() => { next() }, 800)
  }
})
router.afterEach((to, from, next) => {
  store.commit('status/setPageTransition', {state: false})
})

export default router
