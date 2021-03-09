<template>
    <div class="content">

      <div class="show"
      v-bind:style="{'margin-left': show + '%'}">
        <div class="string">
          <slot></slot>
        </div>
      </div>
    </div>

</template>

<script>
export default {
  name: 'notification',
  data: function () {
    return {
      show: 100
    }
  },
  methods: {
  },
  mounted: function () {
    setTimeout(() => {
      this.show = 0
    }, 20)
    setTimeout(() => {
      this.show = 100
    }, 3000)
  }
}
</script>

<style scoped>

.content {
  overflow: hidden;
}

.show {
  width: 100%;
  height: 100%;
  background-color: red;
  margin-left: 100%;
  white-space: nowrap;
  transition: 0.2s;
  transition-timing-function: linear;
}

.string {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 10px;
  color: white;
  font: bold;
}

</style>
