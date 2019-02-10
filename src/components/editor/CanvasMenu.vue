<template lang="pug">
  div.menuCanvas
    canvas#menu_canvas(@click="menu")

    select.dbType(v-if="menuCheck"
    @change="selectDB")
      option(v-for="DBType in DBTypes" :value="DBType") {{ DBType }}
</template>

<script>
import storeERD from '@/store/editor/erd'
import menu from '@/js/editor/THREE_menu'

export default {
  name: 'CanvasMenu',
  data () {
    return {
      DBTypes: ['MySQL', 'Oracle'],
      menuCheck: false
    }
  },
  methods: {
    // DB 선택
    selectDB (e) {
      storeERD.commit({
        type: 'changeDB',
        DBType: e.target.value
      })
    },
    // 메뉴 show, hide
    menu () {
      this.menuCheck = !this.menuCheck
    }
  },
  mounted () {
    menu()
  }
}
</script>

<style lang="scss" scoped>
  .menuCanvas {
    padding: 10px;

    #menu_canvas {
      width: 100px;
      height: 100px;
      position: fixed;
      z-index: 2147483647;
      border-radius: 50px;
      cursor: pointer;
    }
    .dbType {
      position: fixed;
      z-index: 2147483647;
      left: 110px;
    }
  }
</style>
