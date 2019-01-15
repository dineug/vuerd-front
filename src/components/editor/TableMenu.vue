<template lang="pug">
  ul.menuTable
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
import { getZIndex } from '@/js/editor/common'

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
          if (ERD.core.event.isCursor) {
            ERD.core.event.cursor()
          } else {
            ERD.core.event.cursor(type)
          }
          break
        case 'erd-0-1':
          if (ERD.core.event.isCursor) {
            ERD.core.event.cursor()
          } else {
            ERD.core.event.cursor(type)
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
        'z-index': getZIndex('.erd_table')
      })
      $el.show()
    }.bind(this.$el))
    // 메뉴 hide
    $(document).on('mousedown', function (e) {
      const $el = $(this)
      let offset = $el.offset()
      offset.top -= document.documentElement.scrollTop
      offset.left -= document.documentElement.scrollLeft
      offset.width = $el.width()
      offset.height = $el.height()

      if (!(offset.top <= e.clientY &&
        e.clientY <= offset.top + offset.height &&
        offset.left <= e.clientX &&
        e.clientX <= offset.left + offset.width)) {
        $el.hide()
      }
    }.bind(this.$el))
  }
}
</script>

<style lang="scss" scoped>
  $mbg: #191919;
  .menuTable {
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
