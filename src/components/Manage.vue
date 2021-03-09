<template>
    <div class="content" v-if="windowName === 'ManagementPage'">
    <!-- <div class="content"> -->
        <div>
            <div class="head">
                <div class="class" @click="setSortRule('authority')"><button class="btn">Class{{orderStr['authority']}}</button></div>
                <div class="name" @click="setSortRule('name')"><button class="btn">Name{{orderStr['name']}}</button></div>
                <div class="room" @click="setSortRule('room')"><button class="btn">Room{{orderStr['room']}}</button></div>
                <div class="text"><div class="str">Text</div></div>
                <div class="ping" @click="setSortRule('ping')"><button class="btn">Ping{{orderStr['ping']}}</button></div>
            </div>
            <transition-group name='list' tag='div'>
                <div class="data" :style="styleBG(id)" v-for="(user, id) in sortedData" :key="user.id">
                    <div class="class"><div class="str">
                        {{user.authority==='notetaker' ? '上' : user.authority==='freshman' ? '新' : '管'}}
                    </div></div>
                    <div class="name"><div class="str">{{user.name}}</div></div>
                    <div class="room"><div class="str">{{user.room}}</div></div>
                    <div class="text"><div class="str no_c">{{user.text}}</div></div>
                    <div class="ping"><div class="str">{{user.ping}}</div></div>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'Manage',
  title: 'Manage',
  data: function () {
    return {
      windowName: window.name,
      parent_id: undefined,
      manage_id: undefined,
      sample: [{
        id: 'askdfhasdfasdf',
        name: 'default',
        room: 'default',
        authority: 'notetaker',
        text: 'こんにちは',
        ping: 100
      }, {
        id: 'oikuergfnsdfhgusdf',
        name: 'sekya',
        room: 'A',
        authority: 'manager',
        text: 'aaaa',
        ping: 10
      }],
      sortRule: 'none',
      sortOrder: 0
    }
  },
  computed: {
    ...mapState('status', ['manageData']),
    sortedData: function () {
      const compare = function (x, y) {
        if (this.sortOrder === 1) return x[this.sortRule] < y[this.sortRule] ? -1 : 1
        else return x[this.sortRule] > y[this.sortRule] ? -1 : 1
      }.bind(this)
      if (this.sortOrder === 0) return this.manageData
      else return this.manageData.slice().sort(compare)
    },
    orderStr: function () {
      const str = {}
      if (this.sortRule !== 'none') {
        if (this.sortOrder === 1) str[this.sortRule] = '▲'
        else if (this.sortOrder === 2) str[this.sortRule] = '▼'
      }
      return str
    }
  },
  methods: {
    receiveMessage: function (msg) {
      if (msg.origin !== location.origin) return
      if (this.parent_id && this.manage_id) return
      if (msg.data.startsWith && msg.data.startsWith('MANAGE::')) {
        this.manage_id = msg.data.substring(8)
      }
      if (msg.data.startsWith && msg.data.startsWith('PARENT::')) {
        this.parent_id = msg.data.substring(8)
      }
      if (this.parent_id && this.manage_id) {
        this.$store.dispatch('status/manageAuthenticate', {parent: this.parent_id, id: this.manage_id})
      }
    },
    setSortRule: function (item) {
      if (item === this.sortRule) {
        if (this.sortOrder === 2) {
          this.sortRule = 'none'
          this.sortOrder = 0
        } else {
          this.sortOrder += 1
        }
      } else {
        this.sortRule = item
        this.sortOrder = 1
      }
    },
    styleBG: function (id) {
      if (id % 2 === 0) return {'background-color': 'white'}
      else return {'background-color': 'azure'}
    }
  },
  mounted: function () {
    console.log('mounted: manage')
    window.addEventListener('message', this.receiveMessage)
  },
  beforeDestroy: function () {
    console.log('destory: manage')
    window.removeEventListener('message', this.receiveMessage)
  }
}
</script>

<style scoped>

.content {
    width: 100%;
    height: 100%;
    background-color: rgb(220, 235, 235);
    overflow-y: scroll;
}

.head {
    height: 30px;
    letter-spacing: -5px;
    background-color: azure;
}

.data {
    height: 50px;
    letter-spacing: -5px;
    transition: all 0.3s;
}

.class {
    position: relative;
    display: inline-block;
    width: 70px;
    height: 100%;
    letter-spacing: normal;
    border: solid 1px black;
    box-sizing: border-box;
    vertical-align: top;
}

.name {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 100%;
    letter-spacing: normal;
    border: solid 1px black;
    box-sizing: border-box;
    vertical-align: top;
}

.room {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 100%;
    letter-spacing: normal;
    border: solid 1px black;
    box-sizing: border-box;
    vertical-align: top;
}

.text {
    position: relative;
    display: inline-block;
    width: calc(100% - 420px);
    height: 100%;
    letter-spacing: normal;
    border: solid 1px black;
    box-sizing: border-box;
    vertical-align: top;
    overflow-y: hidden;
}

.ping {
    position: relative;
    display: inline-block;
    width: 150px;
    height: 100%;
    letter-spacing: normal;
    border: solid 1px black;
    box-sizing: border-box;
    vertical-align: top;
}

.btn {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    font-size: 16px;
    background-color: azure;
}

.btn:hover {
  background-color: rgb(220, 235, 235);
}

.btn:active {
  background-color: rgb(215, 230, 230);
  box-shadow: inset 2px 2px 2px 0px rgb(170, 205, 205);
  transition: 0.1s;
}

.str {
    position: absolute;
    text-align: center;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin: auto;
    word-break: break-all;
}

.no_c {
    text-align: left;
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(120, 155, 155, 0.7);
  box-shadow:0 0 0 1px rgba(255, 255, 255, .3);
}

::-webkit-scrollbar-thumb:hover {
    background-color: rgba(120, 155, 155, 1);
}

</style>
