<template lang="pug">
  ul#menu_table
    li(v-for="menu in menus" :key="menu.id" @click="menuAction(menu.type)")
      span
        img(:src="menu.icon" v-if="menu.icon !== ''")
        span(v-else)
      span {{ menu.name }}
      span {{ menu.keymap }}
</template>

<script>
import $ from 'jquery'
import ERD from '@/js/editor/ERD'
import storeERD from '@/store/editor/erd'
import * as util from '@/js/editor/util'

export default {
  name: 'TableMenu',
  data () {
    return {
      menus: [
        {
          type: 'pk',
          icon: '',
          name: 'PK',
          keymap: ''
        },
        {
          type: 'erd-0-1',
          icon: '/img/erd/erd-0-1.png',
          name: '1:1',
          keymap: ''
        },
        {
          type: 'erd-0-1-N',
          icon: '/img/erd/erd-0-1-N.png',
          name: '1:N',
          keymap: ''
        }
      ]
    }
  },
  methods: {
    // menu 동작
    menuAction (type) {
      switch (type) {
        case 'pk':
          storeERD.commit({
            type: 'columnKey',
            key: type
          })
          break
        case 'erd-0-1-N':
        case 'erd-0-1':
          if (ERD.core.event.isCursor) {
            ERD.core.event.onCursor('stop')
          } else {
            ERD.core.event.onCursor('start', type)
          }
          break
      }
    }
  },
  mounted () {
    // 오른쪽 클릭 이벤트 등록
    ERD.core.event.addRightClick(function (e) {
      const $el = $(this)
      $el.css({
        top: `${e.clientY}px`,
        left: `${e.clientX}px`,
        'z-index': util.getZIndex()
      })
      $el.show()
    }.bind(this.$el))
  }
}
</script>

<style lang="scss" scoped>
  $mbg: #191919;
  #menu_table {
    color: #a2a2a2;
    background-color: $mbg;
    position: fixed;
    opacity: 0.9;
    display: none;

    li {
      width: 100%;
      height: 100%;
      padding: 10px;
      cursor: pointer;

      &:hover {
        color: white;
        background-color: #383d41;
      }

      & > span {
        padding: 5px;

        img, span {
          display: inline-block;
          width: 20px;
          height: 20px;
        }
      }
    }
  }
</style>
