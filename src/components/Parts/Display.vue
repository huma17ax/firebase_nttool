<template>
    <div class="content">
        <div class="text"
        v-for="(item, id) in texts"
        v-bind:key="id"
        >{{ item }}</div>
        <div :style="{'height': '5px'}"></div>
    </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'display',
  data: function () {
    return {
    }
  },
  computed: {
    ...mapState('status', ['focusTyping']),
    ...mapGetters('status', ['texts'])
  },
  watch: {
    texts: function () {
      setTimeout(function () {
        let cont = this.$el
        cont.scrollTop = cont.scrollHeight - 20
      }.bind(this), 10)
    },
    focusTyping: function () {
      if (this.focusTyping === false) return
      let cnt = 0
      let id = setInterval(function () {
        let cont = this.$el
        cont.scrollTop = cont.scrollHeight - 20
        cnt++
        if (cnt * 10 > 300) clearInterval(id)
      }.bind(this), 10)
    }
  },
  mounted: function () {
    setTimeout(function () {
      let cont = this.$el
      cont.scrollTop = cont.scrollHeight - 20
    }.bind(this), 10)
  }
}
</script>

<style scoped>

.content {
    overflow-y: scroll;
    box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
    border-radius: 10px;
    background-color: white;
}

.text {
    min-height: 20px;
    font-size: 20px;
    padding-left: 10px;
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
