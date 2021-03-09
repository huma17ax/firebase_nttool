export default {
  mounted () {
    let {title} = this.$options
    if (title) {
      title = (typeof title === 'function' ? title.call(this) : title)
      console.log(title)
      document.title = title + ' - NT tool'
    }
  }
}
