<template>
    <div class="content">
        <div class="echo" v-bind:style="{'background-color': echoColorHex}">{{ echoTime }}ms</div>
        <div v-for="(item, id) in notifyQueue" v-bind:key="id">
            <Notification class="notify">{{item}}</Notification>
        </div>
        <img class="logo" src="@/assets/logo.png">
        <button class="btn-c" v-on:click="switchToChat()"><img class="img-c" src="@/assets/chat.png">　Chat</button>

        <button class="btn-s" v-on:click="switchToSetting()"><img class="img-s" src="@/assets/setting.png">　Setting</button>
        <div class="info">
            <!-- <img style="height: 20px; padding-top:5px;" src="@/assets/human.png"> -->
            <div class="status">{{userName}}さん</div>
            <!-- <img style="height: 20px; padding-top:5px;" src="@/assets/team.png"> -->
            <div class="status">Room: {{roomName}}</div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import Notification from './Parts/Notification'

export default {
  name: 'toolHeader',
  components: {
    Notification
  },
  data: function () {
    return {
      echoStatusColor: {
        color: {
          R: 255,
          G: 255,
          B: 255
        },
        time: 0,
        intervalID: undefined
      },
      notifyQueue: []
    }
  },
  computed: {
    ...mapState('status', ['socket', 'connectStatus', 'userName', 'roomName', 'echoTime']),
    echoColorHex: function () {
      let color = [this.echoStatusColor.color.R, this.echoStatusColor.color.G, this.echoStatusColor.color.B]
      color = color.map((val) => 255 - (255 - val) / 10 * this.echoStatusColor.time)
      return '#' + color.map((val) => ('0' + Math.round(val).toString(16)).slice(-2)).join('')
    }
  },
  watch: {
    echoTime: function () {
      if (this.echoStatusColor.intervalID !== undefined) clearInterval(this.echoStatusColor.intervalID)

      if (this.echoTime === -1) this.echoStatusColor.color = {R: 255, G: 10, B: 10}
      if (this.echoTime >= 0 && this.echoTime < 150) this.echoStatusColor.color = {R: 76, G: 217, B: 100}
      if (this.echoTime >= 150 && this.echoTime < 300) this.echoStatusColor.color = {R: 255, G: 204, B: 0}
      if (this.echoTime >= 300 && this.echoTime < 600) this.echoStatusColor.color = {R: 255, G: 149, B: 0}
      if (this.echoTime >= 600) this.echoStatusColor.color = {R: 255, G: 59, B: 48}

      this.echoStatusColor.time = 10

      this.echoStatusColor.intervalID = setInterval(() => {
        this.echoStatusColor.time--
        if (this.echoStatusColor.time < 1) {
          clearInterval(this.echoStatusColor.intervalID)
          this.echoStatusColor.time = 1
          this.echoStatusColor.intervalID = undefined
        }
      }, 500 / 10)
    },
    connectStatus: function () {
      if (this.connectStatus) {
        this.notifyQueue.push('接続されました')
      } else {
        this.notifyQueue.push('接続が切れました')
      }
      setTimeout(() => {
        this.notifyQueue.shift()
      }, 4000)
    }
  },
  methods: {
    switchToChat: function () {
      if (this.$route.path !== '/chat') this.$router.push('/chat')
    },
    switchToSetting: function () {
      if (this.$route.path !== '/setting') this.$router.push('/setting')
    }
  }
}
</script>

<style scoped>

.content {
    position: relative;
    z-index: 3;
    height: 40px;
    width: 100%;
    overflow: visible;
    background-color: rgb(230, 245, 245);
    box-shadow: 0px 0px 8px 0px rgb(170, 205, 205);
}

.logo {
    position: absolute;
    height: 40px;
    padding-left: 10px;
    padding-right: 10px;;
}

.btn-c {
    position: absolute;
    display: inline-block;
    z-index: 10;
    top: 3px;
    height: 37px;
    width: 150px;
    margin-left: 180px;
    background-color: white;
    border: none;
    outline: none;
    border-radius: 10px;
    font-size:24px;
    font-weight:bold;
    text-align:center;
    color:rgb(100, 100, 100);
    box-shadow: 0px 0px 3px 0px rgb(170, 205, 205);
    transition: 0.3s;
}

.btn-c:hover {
    transform: scaleX(1.1) scaleY(1.1) translateY(4px);
    box-shadow: 4px 4px 5px 0px rgb(170, 205, 205);
    transition: 0.3s;
}

.img-c {
    position: absolute;
    z-index: 11;
    top: 4px;
    height: 30px;
    margin-left: -15px;
}

.btn-s {
    position: absolute;
    display: inline-block;
    top: 3px;
    height: 37px;
    width: 160px;
    margin-left: 340px;
    background-color: white;
    border: none;
    outline: none;
    border-radius: 10px;
    font-size:24px;
    font-weight:bold;
    text-align:center;
    color:rgb(100, 100, 100);
    box-shadow: 0px 0px 3px 0px rgb(170, 205, 205);
    transition: 0.3s;
}

.btn-s:hover {
    transform: scaleX(1.1) scaleY(1.1) translateY(4px);
    box-shadow: 4px 4px 5px 0px rgb(170, 205, 205);
    transition: 0.3s;
}

.img-s {
    position: absolute;
    z-index: 11;
    top: 5px;
    height: 27px;
    margin-left: -10px;
}

.info {
    position: absolute;
    display: inline-block;
    height: 25px;
    top: 11px;
    margin-left: 550px;
    border-radius: 10px;
    background-color: white;
    box-shadow: 0px 0px 3px 0px rgb(170, 205, 205);
    transition: 0.3s;
}

.status {
    /* position: absolute; */
    display: inline-block;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 1px;
}

.echo {
    position: absolute;
    text-align: center;
    width: 70px;
    height: 20px;
    line-height: 22px;
    /* border: ridge 1px black; */
    margin-top: 15px;
    margin-left: calc(100% - 85px);
    border-radius: 10px;
    box-shadow: 0px 0px 3px 0px rgb(170, 205, 205);
}

.notify {
    position: absolute;
    margin-left: calc(100% - 185px);
    width: 180px;
    height: 40px;
    box-shadow: none;
}

</style>
