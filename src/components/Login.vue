<template>
    <div class="background">
        <div class="content" :class="{'_open': isOpen}">
            <img class="logo" src="@/assets/logo.png">
            <div style="padding: 96px 0px 15px 20px; font-size: 30px;">ログイン</div>
            <div class="input">
                <p class="title">Authority</p>
                <input class="box" v-model="authority"/>
            </div>
            <div class="input">
                <p class="title">Password</p>
                <input class="box" v-model="password"/>
            </div>
            <button class="btn" @click="login()">Login</button>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'login',
  title: 'Login',
  data: function () {
    return {
      authority: '',
      password: '',
      isOpen: false
    }
  },
  computed: {
    ...mapState('status', ['socket', 'pageTransition'])
  },
  watch: {
    pageTransition: function () {
      if (this.pageTransition) {
        setTimeout(() => { this.isOpen = false }, 1)
      }
    }
  },
  methods: {
    login () {
      const id = (new Buffer.from((this.authority + ':' + this.password).toString(), 'binary')).toString('base64')
      this.socket.emit('login', {id: id})
      console.log('-> send login request')
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
  height: 340px;
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
  padding-bottom: 10px;
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

.btn {
  position: absolute;
  margin-top: 10px;
  right: 20px;
  height: 30px;
  width: 90px;
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
