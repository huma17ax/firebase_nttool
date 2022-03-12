<template>
    <div class="content">
        <div class='schedule'>
          <div class='time'>
            <input class='time-ipt' type='number'
            min='1' max='90'
            v-model='time'
            v-if='!this.scheduleState'>
            {{unit}}
          </div>
          <button class='time-btn' v-on:click='onButton()'>{{ btnText }}</button>
        </div>

        <div class="text-wrapper" :style='{"box-shadow": backShadow}'>
            <div class='text' ref='text' :style='{"background-color": backColor}'>
                <div class='text-el' :style='{"background-color": backColor}'
                v-for="(item, id) in chatTexts"
                v-bind:key='id'>
                {{item}}</div>
            </div>

            <input class='input' v-model='input'
            :placeholder="isfocusing ? '' : ' . . .'"
            v-on:focus='isfocusing = true'
            v-on:blur='isfocusing = false'>
        </div>

        <div>
            <div style="padding: 10px 10px 0px 10px; height: 20px; display: inline-block;">
                {{globalSend ? 'グループ全体' : 'ルームのみ'}}
            </div>
            <div style="padding: 10px 10px 0px 10px; height: 20px; display: inline-block; position: absolute; right: 3px;">
                {{globalSend ? '' : '[Shift]：全体'}}
            </div>
        </div>
    </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'roomchat',
  data: function () {
    return {
      input: '',
      time: 15,
      colorTimer: 0,
      isfocusing: false,
      globalSend: false,
    }
  },
  computed: {
    ...mapState('status', ['socket', 'scheduleState', 'chatTexts']),
    ...mapGetters('status', ['scheduleTime']),
    btnText: function () {
      return this.scheduleState ? '終了' : '開始'
    },
    unit: function () {
      return this.scheduleState ? this.scheduleTime : ' 分'
    },
    backShadow: function () {
      return this.colorTimer > 0 ? '0px 0px 10px 0px rgb(255, 0, 0)' : '0px 0px 6px 0px rgb(170, 205, 205)'
    },
    backColor: function () {
      return this.colorTimer > 0 ? 'rgb(255,100,100)' : 'rgb(255,255,255)'
    }
  },
  watch: {
    chatTexts: function () {
      if (this.chatTexts.length == 0) return
      this.colorTimer += 1
      setTimeout(() => {
        this.colorTimer -= 1
      }, 500)
      setTimeout(function () {
        let cont = this.$refs.text
        cont.scrollTop = cont.scrollHeight - 16
      }.bind(this), 10)
    }
  },
  methods: {
    onButton: function () {
      console.log('Scheduled contact')
      if (this.scheduleState) {
        console.log('-> send contact stop')
        this.$store.dispatch('status/stopSchedule')
      } else {
        console.log('-> send contact start')
        this.$store.dispatch('status/startSchedule', {seconds: this.time*60})
      }
    },
    onKeyDown: function (e) {
      if (this.isfocusing === false) return
      if (e.keyCode === 13 && this.input !== '') {
        if (e.ctrlKey || e.shiftKey || e.altKey) {
          console.log('-> send roomchat global')
          this.$store.dispatch('status/sendGlobalChat', this.input)
          this.input = ''
        } else {
          console.log('-> send roomchat')
          this.$store.dispatch('status/sendRoomChat', this.input)
          this.input = ''
        }
      }
      if (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18) {
        this.globalSend = true
      }
      if (e.keyCode === 27) {
        this.input = ''
      }
    },
    onKeyUp: function (e) {
      if (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18) {
        this.globalSend = false
      }
    }
  },
  mounted: function () {
    console.log('mounted: roomchat')
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    setTimeout(function () {
      let cont = this.$refs.text
      cont.scrollTop = cont.scrollHeight - 16
    }.bind(this), 10)
  },
  beforeDestroy: function () {
    console.log('destory: roomchat')
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }
}
</script>

<style scoped>

.content {
  border: none;
  width: 100%;
  box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
  border-radius: 10px;
  background-color: white;
}

.schedule {
  position: relative;
  width: calc(100% - 20px);
  height: 31px;
  margin: 10px;
  box-shadow: 0px 0px 6px 0px rgb(170, 205, 205);
  border-radius: 10px;
  /* background-color: rgb(235, 250, 250); */
}

.time {
  height: 25px;
  position: relative;
  display: inline-block;
  width: calc(65% - 15px);
  padding-left: 10px;
  padding-top: 4px;
}

.time-ipt {
  width: 40px;
  border: none;
  outline: none;
  font-size: 16px;
}

.time-btn {
  position: absolute;
  display: inline-block;
  top: 3px;
  right: 3px;
  width: 40%;
  max-width: 70px;
  height: 25px;
  border: none;
  outline: none;
  padding: 0px;
  border-radius: 10px;
  background-color: rgb(235, 250, 250);
}

.time-btn:hover {
  background-color: rgb(220, 235, 235);
  transition: 0.25s;
}

.time-btn:active {
  background-color: rgb(215, 230, 230);
  box-shadow: inset 2px 2px 2px 0px rgb(170, 205, 205);
  transition: 0s;
}

.text-wrapper {
  height: calc(100% - 90px);
  width: calc(100% - 20px);
  margin: 10px 10px 0px 10px;
  border-radius: 10px;
  transition: 0.1s;
}

.text {
  height: calc(100% - 30px);
  width: 100%;
  overflow-y: scroll;
  box-shadow: 0px 2px 4px 0px rgba(170, 205, 205, 0.5);
  border-radius: 10px 10px 0px 0px;
  background-color: white;
}

.text-el {
  min-height: 16px;
  font-size: 16px;
  padding-left: 5px;
}

.input {
  width: calc(100% - 5px);
  height: 30px;
  padding: 0px 0px 0px 5px;
  outline: none;
  border: none;
  font-size: 16px;
  border-radius: 0px 0px 10px 10px;
  background-color: rgb(235, 250, 250);
}

.input:hover {
  background-color: rgb(230, 245, 245);
  transition: 0.25s;
}

.input:focus {
  background-color: rgb(230, 245, 245);
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
  border-radius: 0px 10px 0px 0px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(120, 155, 155, 0.7);
  border-radius: 0px 10px 0px 0px;
  box-shadow:0 0 0 1px rgba(255, 255, 255, .3);
}

::-webkit-scrollbar-thumb:hover {
    background-color: rgba(120, 155, 155, 1);
}

</style>
