<template lang="pug">
  .menu_canvas
    ul.menu_top
      li(v-for="(tab, i) in tabs" :key="tab.id")
        input(v-model="tab.name" v-focus
        :class="{ tab_active: tab.active }"
        type="text" :title="i < 9 ? `Ctrl + ${i+1}` : ''"
        @click="modelActive(tab.id)")

        button(:class="{ tab_active: tab.active }"
        @click="modelDelete(tab.id)")
          font-awesome-icon(icon="times")
</template>

<script>
import $ from 'jquery'
import model from '@/store/editor/model'

export default {
  name: 'CanvasMenu',
  directives: {
    // focus 정의
    focus: {
      inserted (el) {
        el.focus()
      }
    }
  },
  computed: {
    tabs () {
      return model.state.tabs
    }
  },
  methods: {
    // 모델 활성화
    modelActive (id) {
      model.commit({
        type: 'modelActive',
        id: id
      })
    },
    // 모델 삭제
    modelDelete (id) {
      model.commit({
        type: 'modelDelete',
        id: id
      })
    }
  },
  updated () {
    // 단축키 활성화 포커스처리
    let index = 0
    for (let i in this.tabs) {
      if (this.tabs[i].active) {
        index = i
        break
      }
    }
    $(this.$el).find('.menu_top input').eq(index).focus()
  }
}
</script>

<style lang="scss" scoped>
  .menu_canvas {

    .menu_top {
      height: 33px;
      position: fixed;
      z-index: 2147483647;

      li {
        height: 33px;
        display: inline-flex;
      }

      .tab_active {
        background-color: #282828;
      }

      button {
        padding: 0;
        width: 25px;
        height: 33px;
        color: #dc3545;
        border: none;
        outline: none;
        cursor: pointer;
        background-color: #424242;
      }

      input {
        padding: 10px;
        background-color: #424242;
      }
    }
  }
</style>
