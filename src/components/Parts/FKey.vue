<template>
    <div class="content">
        <div class="inner">
            F1 <input class="input" v-model=fkey[0] style="border-radius: 0px 10px 0px 0px"><br>
            F2 <input class="input" v-model=fkey[1]><br>
            F3 <input class="input" v-model=fkey[2]><br>
            F4 <input class="input" v-model=fkey[3]><br>
            F5 <input class="input" v-model=fkey[4]><br>
            F6 <input class="input" v-model=fkey[5]><br>
            F7 <input class="input" v-model=fkey[6]><br>
            F8 指定のカッコでくくる<br>
            F9 表示をもとに戻す<br>
            F11 1字削除<br>
            F12 前に空行が入るEnterキー
        </div>
    </div>
</template>

<script>
export default {
  name: 'fkey',
  data: function () {
    return {
      fkey: ['', '', '', '', '', '', '']
    }
  },
  watch: {
    fkey: function () {
      this.$store.commit('status/setFKey', {fkey: this.fkey})
    }
  },
  mounted: function () {
    console.log('mounted: fkey')
    this.fkey = this.$store.state.status.fkey
  }
}
</script>

<style scoped>

.content {
    box-shadow: 8px 8px 8px 0px rgb(170, 205, 205);
    border-radius: 10px;
    overflow: hidden;
    background-color: white;
}

.inner {
    height: calc(100% - 20px);
    width: calc(100% - 15px);
    padding: 10px 5px 10px 10px;
}

.input {
  width: calc(100% - 32px);
  height: 20px;
  margin-bottom: 5px;
  font-size: 15px;
  border: none;
  outline: none;
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

</style>
