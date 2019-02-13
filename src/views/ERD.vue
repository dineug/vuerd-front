<template lang="pug">
  #erd
    canvas-menu
    quick-menu
    canvas-main
    canvas-svg
</template>

<script>
import QuickMenu from '@/components/editor/QuickMenu'
import CanvasMenu from '@/components/editor/CanvasMenu'
import CanvasMain from '@/components/editor/CanvasMain'
import CanvasSvg from '@/components/editor/CanvasSvg'

export default {
  name: 'ERD',
  components: {
    QuickMenu,
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

  body {
    overflow-x: hidden;
    overflow-y: hidden;
  }
  /* width */
  body::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  /* Track */
  body::-webkit-scrollbar-track {
    background: #fafbfe;
    border-left: 1px solid  #e4e6e6;
  }
  /* Handle */
  body::-webkit-scrollbar-thumb {
    background: #aaa;
  }
  /* Handle : hover*/
  body::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
  }
</style>
