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
    ...mapState('status', ['userID'])
  },
  created () {
    console.log('created app')
    this.$store.commit('status/setSocketHandler',
      {
        event: 'connect',
        callback: function () {
          this.$store.commit('status/setConnectStatus', {status: true})
          this.$store.dispatch('status/autoLogin', {route: this.$route})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'connect_error',
        callback: function (err) {
          console.log(err)
          this.$store.commit('status/setConnectStatus', {status: false})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'reconnect',
        callback: function () {
          console.log('reconnect')
          this.$store.commit('status/setConnectStatus', {status: true})
          this.$store.dispatch('status/autoLogin', {route: this.$route})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'text',
        callback: function (msg) {
          console.log('<- receive text')
          this.$store.commit('status/addText', {text: msg.content, id: msg.text_id})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'login',
        callback: function (msg) {
          console.log('<- receive login permitted')
          this.$store.dispatch('status/loginSuccess', {id: msg.id, authority: msg.authority, route: this.$route})
          this.$store.commit('status/setLoginPass', {pass: msg.pass})
          this.$store.commit('status/echoServer', {type: 'req'})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'room_status',
        callback: function (status) {
          console.log('<- receive room status')
          this.$store.commit('status/setRoomStatus', {status: status})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'syn',
        callback: function (msg) {
          console.log('<- receive syn')
          this.$store.commit('status/setMemberText', {id: msg.user, text: msg.content})
          this.$store.dispatch('status/synchronizeText', {type: 'res', hash: msg.hashforecho})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'roomchat',
        callback: function (msg) {
          console.log('<- receive roomchat')
          if (msg.type === 'global') msg.content = '[G]' + msg.content
          this.$store.commit('status/addChatText', {text: msg.content})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'contact',
        callback: function (msg) {
          console.log('<- receive contact')
          this.$store.commit('status/setSchedule', msg.content)
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'echo',
        callback: function () {
          console.log('<- receive echo')
          this.$store.commit('status/echoServer', {type: 'res'})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'undo',
        callback: function (msg) {
          console.log('<- receive undo')
          this.$store.commit('status/undoText', {user: msg.user, text_id: msg.text_id})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'delete1',
        callback: function (msg) {
          console.log('<- receive delete1')
          this.$store.commit('status/delete1Char', {text_id: msg.text_id})
        }.bind(this)
      })
    // -----management-----
    this.$store.commit('status/setSocketHandler',
      {
        event: 'manage_id',
        callback: function (msg) {
          console.log('<- receive manage id')
          this.$store.dispatch('status/sendManageID', {id: msg.id})
        }.bind(this)
      })
    this.$store.commit('status/setSocketHandler',
      {
        event: 'manage_data',
        callback: function (msg) {
          console.log('<- receive manage data')
          this.$store.commit('status/setManageData', {data: msg})
        }.bind(this)
      })
    window.addEventListener('beforeunload', this.onUnload)
    firebase.database().ref('.info/connected').on('value', (snapshot) => {
      this.$store.commit('status/setConnectStatus', snapshot.val())
    })
  },
  methods: {
    onUnload() {
      this.$store.dispatch('status/logout')
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
