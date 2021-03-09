import Vue from 'vue'
import Router from 'vue-router'
import Chat from '@/components/Chat'
import Setting from '@/components/Setting'
import Login from '@/components/Login'
import Manage from '@/components/Manage'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
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
    }
  ]
})

export default router
