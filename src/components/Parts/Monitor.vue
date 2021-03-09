<template>
    <div class="content">
        <div v-if="roomMembers.length==0" style="padding: 10px 0px 0px 10px; color: rgba(0, 0, 0, 0.2); font-size: 18px;">
            No other members in this room
        </div>
        <div class="member"
        v-for="(item, id) in roomMembers" v-bind:key="id">
            <div class="name">
                <div class="text">{{item.name}}</div>
            </div>
            <div class="input">
                <div class="text">{{item.input}}</div>
            </div>
            <hr v-if="!(roomMembers.length>=3 && id==roomMembers.length-1)">
        </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: 'monitor',
  components: {

  },
  data: function () {
    return {

    }
  },
  computed: {
    ...mapGetters('status', ['roomMembers'])
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

hr {
    margin: 0;
}

.member {
    height: 50px;
}

.name {
    position: relative;
    display: inline-block;
    width: 150px;
    height: 100%;
    vertical-align: top;
    box-sizing: border-box;
    border-right: solid 1px black;
}

.input {
    position: relative;
    display: inline-block;
    width: calc(100% - 155px);
    height: 100%;
    vertical-align: top;
    box-sizing: border-box;
    /* border: ridge 2px blue; */
}

.name .text {
    text-align: center;
}

.text {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin: auto;
    word-break: break-all;
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
