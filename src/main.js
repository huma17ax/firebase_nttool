import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import title from './mixin/title'
import firebase from '@/firebase/init'

Vue.config.productionTip = false
Vue.mixin(title)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
  template: '<App/>'
})
