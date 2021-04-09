<template>
  <div id="app">
    <toolHeader v-if="$route.path=='/chat' || $route.path=='/setting'"></toolHeader>
    <router-view/>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import toolHeader from '@/components/Header'
import firebase from '@/firebase/init'

export default {
  name: 'App',
  components: {
    toolHeader
  },
  computed: {
  },
  created () {
    console.log('created app')
    window.addEventListener('beforeunload', this.onUnload)
    firebase.database().ref('.info/connected').on('value', (snapshot) => {
      this.$store.commit('status/setConnectStatus', snapshot.val())
    })
    firebase.auth().onAuthStateChanged((user) => {
      if (user) this.$store.commit('status/setAuthID', user.uid)
    })
    firebase.auth().signInAnonymously()
      .then(() => {
        console.log('You sign in as anonymous.')
      })
      .catch(() => {
        console.error('You cannot sign in as anonymous.')
      })
  },
  methods: {
    onUnload() {
      this.$store.dispatch('status/leaveGroup')
    }
  },
  beforeDestroy () {
    console.log('destroy app')
  },
  destroyed () {
    window.removeEventListener('beforeunload', this.onUnload)
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  margin: 0;
}

html,body {
    width: 100%;
    height: 100%;
    margin: 0;
}
</style>
