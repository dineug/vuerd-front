<template lang="pug">
  .menu_canvas
    draggable.menu_top(element="ul" v-model="model.tabs" :options="{group:'tab', ghostClass: 'ghost'}")
      transition-group(type="transition" name="flip-list")
        li(v-for="(tab, i) in model.tabs" :key="tab.id")
          input(v-model="tab.name" v-focus
          :class="{ tab_active: tab.active }"
          type="text" :title="i < 9 ? `Ctrl + ${i+1}` : ''"
          @click="modelActive(tab.id)")

          button(:class="{ tab_active: tab.active }"
          @click="modelDelete(tab.id)")
            font-awesome-icon(icon="times")
    ul.menu_sidebar
      li(v-for="menu in menus" :key="menu.id") {{ menu.name }}
</template>

<script>
import $ from 'jquery'
import model from '@/store/editor/model'
import draggable from 'vuedraggable'

export default {
  name: 'CanvasMenu',
  components: {
    draggable
  },
  directives: {
    // focus 정의
    focus: {
      inserted (el) {
        el.focus()
      }
    }
  },
  data () {
    return {
      menus: [
        {
          type: '',
          icon: '',
          isImg: '',
          name: '1'
        }
      ]
    }
  },
  computed: {
    model () {
      return model.state
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
    for (let i in this.model.tabs) {
      if (this.model.tabs[i].active) {
        $(this.$el).find('.menu_top input').eq(i).focus()
        break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .menu_canvas {

    .menu_top {
      height: 33px;
      position: fixed;
      left: 40px;
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
        color: #a2a2a2;
        border: none;
        outline: none;
        cursor: pointer;
        background-color: #424242;

        &:hover {
          color: white;
        }
      }

      input {
        padding: 10px;
        width: 150px;
        background-color: #424242;
      }
    }

    .menu_sidebar {
      width: 40px;
      height: 100%;
      position: fixed;
      z-index: 2147483647;
      background-color: white;
    }

    .ghost {
      opacity: 0.5;
    }
    /* 이동 animation */
    .flip-list-move {
      transition: transform 0.5s;
    }
    /* 추가,삭제 animation */
    .flip-list-enter-active {
      transition: all .3s ease;
    }
    .flip-list-leave-active {
      transition: all .4s ease-out;
    }
    .flip-list-enter, .flip-list-leave-to {
      transform: translateX(10px);
      opacity: 0;
    }
  }
</style>
