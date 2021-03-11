<template>
    <div class="content_wrapper">
        <div class="slider"
        v-on:mouseover="switchSliderVisible(true)"
        v-on:mouseleave="switchSliderVisible(false)">
            <input type="range" class="slider-ipt" v-if="sliderVisible"
            min="0" max="20" step="1" v-model="sliderValue">
        </div>
        <fkey class="fkey" :class="{'_open': isOpen.fkey}" :style="{'width': 'calc(100% - '+breakWidth+'% - 10px)','margin-left': breakWidth+'%'}"></fkey>
        <roomchat class="roomchat" :class="{'_open': isOpen.roomchat}" :style="{'width': 'calc(100% - '+breakWidth+'% - 10px)', 'margin-left': breakWidth+'%'}"></roomchat>
        <div :style="{'height': '10px'}"></div>
        <display class="display"
        :class="{'mini-display': focusTyping, '_open': isOpen.display}"
        :style="{'width': 'calc('+breakWidth+'% - 25px)'}"></display>
        <monitor class="monitor" :class="{'_open': isOpen.monitor}" :style="{'width': 'calc('+breakWidth+'% - 25px)'}" v-if="methodType!='1'"></monitor>
        <typing class="typing" :class="{'_open': isOpen.typing}" :style="{'width': 'calc('+breakWidth+'% - 25px)'}"></typing>
        <monitor class="monitor" :class="{'_open': isOpen.monitor}" :style="{'width': 'calc('+breakWidth+'% - 25px)'}" v-if="methodType=='1'"></monitor>
    </div>
</template>

<script>
import typing from './Parts/Typing'
import display from './Parts/Display'
import monitor from './Parts/Monitor'
import fkey from './Parts/FKey'
import roomchat from './Parts/RoomChat'

import {mapState} from 'vuex'

export default {
  name: 'chat',
  title: 'Chat',
  components: {
    display,
    typing,
    monitor,
    fkey,
    roomchat
  },
  data: function () {
    return {
      sliderVisible: false,
      sliderValue: 17,
      isOpen: {
        display: false,
        typing: false,
        monitor: false,
        fkey: false,
        roomchat: false
      }
    }
  },
  computed: {
    ...mapState('status', ['focusTyping', 'methodType', 'pageTransition']),
    breakWidth: function () {
      return 60 + Number(this.sliderValue)
    }
  },
  watch: {
    pageTransition: function () {
      if (this.pageTransition) {
        setTimeout(() => { this.isOpen.display = false }, 1)
        setTimeout(() => { this.isOpen.typing = false }, 100)
        setTimeout(() => { this.isOpen.monitor = false }, 200)
        setTimeout(() => { this.isOpen.fkey = false }, 300)
        setTimeout(() => { this.isOpen.roomchat = false }, 400)
      }
    }
  },
  methods: {
    switchSliderVisible: function (state) {
      this.sliderVisible = state
    }
  },
  mounted: function () {
    console.log('mounted: chat')
    setTimeout(() => { this.isOpen.display = true }, 50)
    setTimeout(() => { this.isOpen.typing = true }, 150)
    setTimeout(() => { this.isOpen.monitor = true }, 250)
    setTimeout(() => { this.isOpen.fkey = true }, 350)
    setTimeout(() => { this.isOpen.roomchat = true }, 450)
  },
  beforeDestroy: function () {
    console.log('destory: chat')
  }
}
</script>

<style scoped>

.content_wrapper {
    z-index: 1;
    width: 100%;
    height: calc(100% - 40px);
    background-color: rgb(220, 235, 235);
    box-sizing: border-box;
    /* border: ridge 2px rgb(27, 69, 255); */
}

.slider {
    z-index: 13;
    position: absolute;
    width: 20%;
    height: 21px;
    margin-left: 60%;
    margin-top: -21px;
}

.slider-ipt {
  width: 100%;
  height: 10px;
  border-radius: 4px;
  -webkit-appearance:none;
  background-color: rgba(255,255,255,1);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
  outline: none;
}

.slider-ipt::-webkit-slider-thumb {
  -webkit-appearance:none;
  background-color: rgba(120, 155, 155, 1);
  height:20px;
  width:20px;
  border-radius:50%;
}

.display {
    opacity: 0;
    height: calc(100% - 265px);
    margin-left: 10px;
    margin-right: 10px;
    transition: 0.3s;
}

.mini-display {
    height: calc(100% - 250px - 180px);
    transition: 0.3s;
}

.typing {
    opacity: 0;
    position: relative;
    height: 65px;
    margin-top: 15px;
    margin-left: 10px;
    margin-right: 10px;
    transition: 0.3s;
}

.monitor {
    opacity: 0;
    height: 150px;
    margin-top: 15px;
    margin-left: 10px;
    margin-right: 10px;
    transition: 0.3s;
}

.fkey {
    opacity: 0;
    position: absolute;
    height: 40%;
    transition: 0.3s;
    top: 50px;
}

.roomchat {
    opacity: 0;
    height: calc(50vh - 50px);
    position: absolute;
    margin-top: 50vh;
    transition: 0.3s;
}

._open {
    opacity: 1;
    transition: 0.3s;
}

</style>
