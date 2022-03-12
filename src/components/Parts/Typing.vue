<template>
    <div class="content" :style="focusStyle">
        <textarea
        class = "input"
        wrap="soft"
        v-bind:value="input"
        ref='input'
        :placeholder="isfocusing ? '' : 'type something ...'"
        v-on:input="onInput()"
        v-on:focus="isfocusing = true"
        v-on:blur="isfocusing = false"></textarea>
    </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'typing',
  data: function () {
    return {
      input: '',
      pressedkey: {},
      isfocusing: false
    }
  },
  computed: {
    ...mapState('status', ['socket', 'fkey', 'undoneText', 'methodType']),
    ...mapGetters('status', ['roomMembers']),
    focusStyle: function () {
      if (this.isfocusing) return {'box-shadow': '4px 4px 4px 0px rgb(150, 185, 185)'}
      else return {}
    }
  },
  watch: {
    undoneText: function () {
      if (this.undoneText === '') return
      this.input = this.undoneText + this.input
      this.$store.commit('status/resetUndoneText')
      console.log('-> send syn')
      this.$store.dispatch('status/synchronizeText', this.input)
    },
    isfocusing: function () {
      if (this.methodType === '3') {
        this.$store.commit('status/setFocusTyping', this.isfocusing)
      }
    }
  },
  methods: {
    onInput: function () {
      this.input = this.$refs.input.value
      console.log('-> send')
      this.$store.dispatch('status/synchronizeText', this.input)
    },
    onKeyDown: function (e) {
      if (this.isfocusing === false) return
      let synUpdate = false

      if (e.keyCode === 27) {
        this.input = ''
        synUpdate = true
      }
      if (e.keyCode >= 112 && e.keyCode <= 118) {
        e.preventDefault()
        this.input += this.fkey[e.keyCode - 112]
        synUpdate = true
      }
      if (e.keyCode === 119) {
        e.preventDefault()
        if (e.ctrlKey) {
          this.input = '♪' + this.input + '♪'
        } else {
          this.input = '「' + this.input + '」'
        }
        synUpdate = true
      }
      if (e.keyCode === 120) {
        e.preventDefault()
        let id = this.$store.state.status.texts.slice(-1)[0][1]
        this.$store.dispatch('status/undoText')
      }
      if (e.keyCode === 122) {
        e.preventDefault()
        let id = this.$store.state.status.texts.slice(-1)[0][1]
        this.$store.dispatch('status/delete1')
      }
      if (e.keyCode === 123) {
        e.preventDefault()
        console.log('-> send text')
        if (this.input === '') this.input = '\n'
        this.$store.dispatch('status/sendText', '\n' + this.input)
        this.input = ''
        synUpdate = true
      }
      if (e.keyCode === 13) {
        e.preventDefault()
        if (e.ctrlKey) {
          let pos = this.$refs.input.selectionStart
          this.input = this.input.substring(0, pos) + '\n' + this.input.substring(pos, this.input.length)
          setTimeout(function () {
            this.$refs.input.setSelectionRange(pos + 1, pos + 1)
            this.$refs.input.scrollTop = this.$refs.input.scrollHeight - 20
          }.bind(this), 10)
        } else {
          console.log('-> send text')
          if (this.input === '') this.input = '\n'
          this.$store.dispatch('status/sendText', this.input)
          this.input = ''
        }
        synUpdate = true
      }

      if (synUpdate) {
        console.log('-> send syn')
        this.$store.dispatch('status/synchronizeText', this.input)
      }
    },
    onKeyUp: function (e) {
    }
  },
  mounted: function () {
    console.log('mounted: typing')
    window.addEventListener('keydown', this.onKeyDown, {passive: false})
    window.addEventListener('keyup', this.onKeyUp)
  },
  beforeDestroy: function () {
    console.log('destory: typing')
    this.$store.dispatch('status/synchronizeText', '')
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }
}
</script>

<style scoped>

.content {
    /* padding-left: 5px;
    padding-right: 4px;
    padding-top: 0px;
    padding-bottom: 4px; */
    box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
    border-radius: 10px;
    background-color: white;
}

.input {
  resize: none;
  width: calc(100% - 20px);
  height: calc(100% - 10px);
  /* margin: 0px 0px 0px 10px; */
  font-size: 18px;
  /* font-weight: bold; */
  padding: 5px 10px 5px 10px;
  /* padding: 0px; */
  font-family: Arial, Helvetica, sans-serif;
  border: none;
  outline: none;
  background-color: transparent;
}

.input::placeholder {
    color:rgba(0, 0, 0, 0.2)
}
.input:-ms-input-placeholder {
    color:rgba(0, 0, 0, 0.2)
}
.input::-ms-input-placeholder {
    color:rgba(0, 0, 0, 0.2)
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

</style>
