<template>
    <div class="content">
        <div style="height: 10px; opacity: 0;"></div>
        <div class="info" :class="{'_open': isOpen.info}">
            <div style="padding: 10px 0px 0px 10px; width: 50%;">Name:</div>
            <input class="input" v-model="name">
            <div style="padding-left: 10px; width: 50%;">Room:</div>
            <input class="input" v-model="room">
            <div style="padding-left: 10px; width: 50%;">{{password}}</div>
        </div>
        <div class="echo" :class="{'_open': isOpen.echo}">
            <div style="position: relative; width: 100%; height: 100%;">
                <button class="echo-btn" v-on:click="echo()">Echo</button>
                <div class="echo-txt">{{ echoTime }}ms</div>
            </div>
        </div>
        <div class="method-sel" :class="{'_open': isOpen.method}">
            <div style="padding: 5px 0px 0px 5px; width: 100%; height: 100%;">
                <input class="method-item" type="radio" name="method" value="1" v-model="method">Type1(old)
                <input class="method-item" type="radio" name="method" value="2" v-model="method">Type2
                <input class="method-item" type="radio" name="method" value="3" v-model="method">Type3
            </div>
        </div>
        <div class="manage" v-if="authority=='manager'" :class="{'_open': isOpen.manage}">
            <button class="manage-btn" @click="openSubWindow()">管理ページ</button>
        </div>
        <div class="update" v-if="authority=='notetaker' || authority=='manager'" :class="{'_open': isOpen.update}">
            <div v-for="(ver,id) in update_info" :key="id">
                <div v-for="(c,id2) in ver" :key="id2" style="padding-left: 10px;">
                    {{c}}<br>
                </div>
                <p style="height: 20px;"></p>
            </div>
        </div>
        <div class="logout" :class="{'_open': isOpen.logout}">
            <button class="logout-btn" @click="logout()">ログアウト</button>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import UPDATE from '@/assets/updateInformation.js'

export default {
  name: 'setting',
  title: 'Setting',
  data: function () {
    return {
      name: '',
      room: '',
      method: undefined,
      update_info: UPDATE,
      isOpen: {
        info: false,
        echo: false,
        method: false,
        manage: false,
        logout: false,
        update: false
      }
    }
  },
  computed: {
    ...mapState('status', ['password', 'userName', 'roomName', 'authority', 'echoTime', 'methodType', 'pageTransition']),
  },
  watch: {
    method: function () {
      this.$store.commit('status/changeMethodType', this.method)
    },
    pageTransition: function () {
      if (this.pageTransition) {
        setTimeout(() => { this.isOpen.info = false }, 1)
        setTimeout(() => { this.isOpen.echo = false }, 80)
        setTimeout(() => { this.isOpen.method = false }, 160)
        setTimeout(() => { this.isOpen.manage = false }, 240)
        setTimeout(() => { this.isOpen.logout = false }, 320)
        setTimeout(() => { this.isOpen.update = false }, 400)
      }
    }
  },
  methods: {
    echo: function () {
      this.$store.commit('status/echoServer', {type: 'req'})
    },
    openSubWindow: function () {
      this.$store.dispatch('status/openManagePage', {})
    },
    logout: function () {
      this.$store.dispatch('status/logout')
    }
  },
  mounted: function () {
    console.log('mounted: setting')
    this.name = this.userName
    this.room = this.roomName
    this.method = this.methodType
    setTimeout(() => { this.isOpen.info = true }, 50)
    setTimeout(() => { this.isOpen.echo = true }, 130)
    setTimeout(() => { this.isOpen.method = true }, 210)
    setTimeout(() => { this.isOpen.manage = true }, 290)
    setTimeout(() => { this.isOpen.logout = true }, 370)
    setTimeout(() => { this.isOpen.update = true }, 450)
  },
  beforeDestroy: function () {
    console.log('destroy: setting')
    this.$store.dispatch('status/setUserName', this.name).then(()=>{
      this.$store.dispatch('status/joinRoom', this.room)
    })
  }
}
</script>

<style scoped>

.content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: calc(100% - 40px);
    box-sizing: border-box;
    background-color: rgb(220, 235, 235);
}

.info {
    opacity: 0;
    width: 25%;
    height: 200px;
    margin-left: 10px;
    box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
    border-radius: 10px;
    background-color: white;
    transition: 0.3s;
}

.input {
  width: calc(100% - 40px);
  height: 20px;
  margin: 3px 20px 10px 20px;
  border: none;
  outline: none;
  font-size: 16px;
  border-bottom: ridge 1px rgb(200, 215, 215);
  background-color: rgb(235, 250, 250);
}

.input:hover {
  background-color: rgb(230, 245, 245);
}

.input:focus {
  background-color: rgb(220, 235, 235);
  transition: 0.25s;
}

.echo {
    opacity: 0;
    position: absolute;
    top: 10px;
    left: calc(25% + 25px);
    height: 31px;
    width: 25%;
    box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
    border-radius: 10px;
    background-color: white;
    transition: 0.3s;
}

.echo-btn {
  position: absolute;
  display: inline-block;
  top: 3px;
  left: 3px;
  width: 30%;
  height: 25px;
  border: none;
  outline: none;
  padding: 0px;
  border-radius: 10px;
  background-color: rgb(235, 250, 250);
}

.echo-btn:hover {
  background-color: rgb(220, 235, 235);
  transition: 0.25s;
}

.echo-btn:active {
  background-color: rgb(215, 230, 230);
  box-shadow: inset 2px 2px 2px 0px rgb(170, 205, 205);
  transition: 0s;
}

.echo-txt {
  position: absolute;
  display: inline-block;
  top: 7px;
  left: calc(30% + 13px);
}

.method-sel {
    opacity: 0;
    position: absolute;
    top: 56px;
    left: calc(25% + 25px);
    height: 31px;
    width: 25%;
    box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
    border-radius: 10px;
    background-color: white;
    transition: 0.3s;
}

.manage {
    opacity: 0;
    position: absolute;
    top: 102px;
    left: calc(25% + 25px);
    height: 31px;
    width: 25%;
    box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
    border-radius: 10px;
    background-color: white;
    transition: 0.3s;
}

.manage-btn {
  position: absolute;
  top: 3px;
  left: 5px;
  width: calc(100% - 10px);
  height: 25px;
  border: none;
  outline: none;
  padding: 0px;
  text-align: center;
  border-radius: 10px;
  background-color: rgb(235, 250, 250);
}

.manage-btn:hover {
  background-color: rgb(220, 235, 235);
  transition: 0.25s;
}

.manage-btn:active {
  background-color: rgb(215, 230, 230);
  box-shadow: inset 2px 2px 2px 0px rgb(170, 205, 205);
  transition: 0s;
}

.logout {
    opacity: 0;
    position: absolute;
    top: 10px;
    left: calc(50% + 40px);
    height: 55px;
    width: calc(20% - 30px);
    box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
    border-radius: 10px;
    background-color: white;
    transition: 0.3s;
}

.logout-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  width: calc(100% - 20px);
  height: 35px;
  border: none;
  outline: none;
  padding: 0px;
  text-align: center;
  border-radius: 10px;
  background-color: rgb(235, 250, 250);
}

.logout-btn:hover {
  background-color: rgb(220, 235, 235);
  transition: 0.25s;
}

.logout-btn:active {
  background-color: rgb(215, 230, 230);
  box-shadow: inset 2px 2px 2px 0px rgb(170, 205, 205);
  transition: 0s;
}

.update {
    opacity: 0;
    width: 70%;
    height: calc(90% - 225px);
    margin-left: 10px;
    margin-top: 15px;
    box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
    border-radius: 10px;
    background-color: white;
    overflow-y: scroll;
    transition: 0.3s;
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
  border-radius: 0px 10px 10px 0px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(120, 155, 155, 0.7);
  border-radius: 0px 10px 10px 0px;
  box-shadow:0 0 0 1px rgba(255, 255, 255, .3);
}

::-webkit-scrollbar-thumb:hover {
    background-color: rgba(120, 155, 155, 1);
}

._open {
    opacity: 1;
    transition: 0.3s;
}
</style>
