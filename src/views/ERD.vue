<template lang="pug">
  #erd
    table-menu
    canvas-menu
    canvas-main
    canvas-svg
</template>

<script>
import '@/js/editor/ERD'
import TableMenu from '@/components/editor/TableMenu'
import CanvasMenu from '@/components/editor/CanvasMenu'
import CanvasMain from '@/components/editor/CanvasMain'
import CanvasSvg from '@/components/editor/CanvasSvg'

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
