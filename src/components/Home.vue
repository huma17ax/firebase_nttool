<template>
    <div class="background">
        <div class="content" :class="{'_open': isOpen}">
            <img class="logo" src="@/assets/logo.png">
            <div style="padding: 96px 0px 20px 20px; font-size: 30px;"></div>
            <div style="text-align: center; color: red;" v-if="loginFailed && !isTryToJoin && !isTryToMake">{{loginFailed}}</div>
            <div style="text-align: center; color: red;" v-if="!connectStatus">インターネットに繋がっていません</div>
            <div class="input">
                <p class="title">グループ名</p>
                <input class="box" :disabled="isTryToMake" v-model="groupName"/>
            </div>
            <div class="caution" v-if="!isValidGroupName && !isTryToJoin">1バイト文字のみ</div>
            <div class="caution" v-if="isTryToMake">この名前でグループを作成しますか？</div>
            <div class="input" v-if="isTryToJoin">
                <p class="title">パスワード</p>
                <input class="box" v-model="password"/>
            </div>
            <button class="btn" style="right: 130px;" @click="makeGroup()" v-if="!isTryToJoin && !isTryToMake">ルームを作る</button>
            <button class="btn" style="right: 20px;" @click="joinGroup()" v-if="!isTryToMake">ルームに入る</button>
            <button class="btn" style="right: 130px;" @click="cancel()" v-if="!isTryToJoin && isTryToMake">キャンセル</button>
            <button class="btn" style="right: 20px;" @click="makeGroup()" v-if="isTryToMake">ルームを作る</button>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'home',
  title: 'Home',
  data: function () {
    return {
      groupName: '',
      password: '',
      isTryToMake: false,
      isTryToJoin: false,
      isOpen: false
    }
  },
  computed: {
    ...mapState('status', ['connectStatus', 'loginFailed', 'pageTransition']),
    isValidGroupName () {
      return Boolean(this.groupName.match(/^[\x01-\x7E]+$/g))
    }
  },
  watch: {
    loginFailed: function () {
      if (this.loginFailed) {
        this.password = ''
        this.isTryToMake = false
        this.isTryToJoin = false
      }
    },
    pageTransition: function () {
      if (this.pageTransition) {
        setTimeout(() => { this.isOpen = false }, 1)
      }
    },
    groupName: function () {
      this.isTryToJoin = false
      this.password = ''
      this.$store.commit('status/setLoginFailed', '')
    }
  },
  methods: {
    makeGroup () {
      if (!this.isValidGroupName) return
      if (!this.connectStatus) return
      if (!this.isTryToMake) {
        this.isTryToMake = true
        return
      }
      //[FIREBASE] make_group
      this.$store.dispatch('status/makeGroup', {groupName: this.groupName})
    },
    cancel () {
      this.isTryToMake = false
    },
    joinGroup () {
      if (!this.isValidGroupName) return
      if (!this.connectStatus) return
      if (this.isTryToJoin) {
        //[FIREBASE] join_group
        // this.$router.push('/chat')
        this.$store.dispatch('status/joinGroup', {groupName: this.groupName, password: this.password})
      } else {
        this.isTryToJoin = true
      }
    }
  },
  mounted: function () {
    console.log('mounted: login')
    this.$store.dispatch('status/autoLogin')
    setTimeout(() => { this.isOpen = true }, 50)
  },
  beforeDestroy: function () {
    console.log('destory: login')
  }
}
</script>

<style scoped>

.background {
  position: relative;
  background-color: rgb(220, 235, 235);
  width: 100%;
  height: 100%;
}

.content {
  opacity: 0;
  position: absolute;
  width: 50%;
  max-width: 600px;
  min-width: 420px;
  height: 300px;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin-top: 20vh;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
  border-radius: 10px;
  background-color: white;
  transition: 0.3s;
}

.logo {
  position: absolute;
  display: inline-block;
  width: 250px;
  height: 66px;
  margin-top: 10px;
  margin-left: calc((100% - 250px) * 0.48);
}

.input {
  display: flex;
  padding-right: 20px;
  padding-top: 10px;
}

.title {
  display: inline-block;
  margin: auto;
  padding-left: 20px;
  width: 20%;
  height: 30px;
  overflow: hidden;
}

.box {
  display: inline-block;
  height: 30px;
  width: calc(80% - 40px);
  font-size: 20px;
  border: none;
  outline: none;
  border-bottom: ridge 2px rgb(200, 215, 215);
  background-color: rgb(235, 250, 250);
}

.box:hover {
  background-color: rgb(230, 245, 245);
}

.box:focus {
  background-color: rgb(220, 235, 235);
  transition: 0.25s;
}

.caution {
  margin-left: calc(20% + 35px);
  color: red;
}

.btn {
  position: absolute;
  margin-top: 10px;
  height: 30px;
  width: 100px;
  border: none;
  outline: none;
  border-radius: 10px;
  background-color: rgb(235, 250, 250);
  box-shadow: 0px 0px 4px 0px rgb(170, 205, 205);
}

.btn:hover {
  background-color: rgb(220, 235, 235);
  box-shadow: 0px 0px 1px 0px rgb(170, 205, 205);
  transition: 0.25s;
}

.btn:active {
  background-color: rgb(215, 230, 230);
  box-shadow: inset 2px 2px 2px 0px rgb(170, 205, 205);
  transition: 0s;
}

._open {
    opacity: 1;
    transition: 0.3s;
}
</style>
