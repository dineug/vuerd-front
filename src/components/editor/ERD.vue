<template lang="pug">
  #erd
    table-menu
    canvas-menu
    canvas-main
    canvas-svg
</template>

<script>
import '@/js/editor/ERD'
import TableMenu from './TableMenu'
import CanvasMenu from './CanvasMenu'
import CanvasMain from './CanvasMain'
import CanvasSvg from './CanvasSvg'

export default {
  name: 'ERD',
  components: {
    TableMenu,
    CanvasMenu,
    CanvasMain,
    CanvasSvg
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  #erd {
    display: flex;
    width: 5000px;
    height: 5000px;
    z-index: 2;
    background-color: #282828;
  }

  input {
    color: white;
    border: none;
    background-color: #191919;
  }
  *:focus {
    outline: none;
  }
</style>
