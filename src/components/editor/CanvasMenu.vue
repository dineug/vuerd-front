<template lang="pug">
  .menu_canvas
    // 메뉴 top
    draggable.menu_top(element="ul" v-model="model.tabs" :options="{group:'tab', ghostClass: 'ghost'}")
      transition-group(type="transition" name="fade")

        li(v-for="(tab, i) in model.tabs" :key="tab.id")
          input(v-model="tab.name" v-focus
          :class="{ tab_active: tab.active }"
          type="text" :title="i < 9 ? `Ctrl + ${i+1}` : ''"
          @click="modelActive(tab.id)")

          span.buttons(:class="{ tab_active: tab.active }")
            button(title="Ctrl + Delete"
            @click="modelDelete(tab.id)")
              font-awesome-icon(icon="times")

    // 메뉴 sidebar left
    ul.menu_sidebar
      li(v-for="menu in menus" :key="menu.id" :title="menu.name"
      @click="menuAction(menu.type)")
        font-awesome-icon(:icon="menu.icon")
        ol(v-if="menu.type === 'DBType'")
          li(:class="{ db_active: DBType === 'MySQL' }"
          @click="changeDB('MySQL')") MySQL
          li(:class="{ db_active: DBType === 'Oracle' }"
          @click="changeDB('Oracle')") Oracle

    // 메뉴 Preview Navigation
    canvas-main.preview(:style="`top: ${preview.top}px; left: ${preview.left}px;`")
    .preview_border(:style="`top: ${preview.y}px; left: ${preview.x}px;`")
      .preview_target(:style="`top: ${preview.target.y}px; left: ${preview.target.x}px; width: ${preview.target.width}px; height: ${preview.target.height}px;`"
      @mousedown="onPreview")
</template>

<script>
import $ from 'jquery'
import ERD from '@/js/editor/ERD'
import model from '@/store/editor/model'
import draggable from 'vuedraggable'
import CanvasMain from './CanvasMain'
import CanvasSvg from './CanvasSvg'

export default {
  name: 'CanvasMenu',
  components: {
    draggable,
    CanvasMain,
    CanvasSvg
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
      preview: {
        top: (-1 * 5000 / 2) + (150 / 2) + 53,
        left: 0,
        x: 0,
        y: 53,
        target: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      },
      menus: [
        {
          type: 'DBType',
          icon: 'database',
          name: 'DB'
        },
        {
          type: 'save',
          icon: 'save',
          name: 'save'
        },
        {
          type: 'export-png',
          icon: 'file-image',
          name: 'export-png'
        },
        // {
        //   type: 'import-sql',
        //   icon: 'file-upload',
        //   name: 'import-sql'
        // },
        {
          type: 'export-sql',
          icon: 'file-download',
          name: 'export-sql'
        },
        {
          type: 'import-json',
          icon: 'file-import',
          name: 'import-json'
        },
        {
          type: 'export-json',
          icon: 'file-export',
          name: 'export-json'
        }
      ]
    }
  },
  computed: {
    model () {
      return model.state
    },
    DBType () {
      return ERD.store().state.DBType
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
    },
    // sidebar action
    menuAction (type) {
      switch (type) {
        case 'export-png':
          ERD.core.file.exportData('png')
          break
        case 'export-sql':
          ERD.core.file.exportData('sql')
          break
        case 'import-json':
          ERD.core.file.click('json')
          break
        case 'export-json':
          ERD.core.file.exportData('json')
          break
      }
    },
    // 미리보기 네비게이션 이벤트 시작
    onPreview () {
      ERD.core.event.onPreview('start')
    },
    // DB 변경
    changeDB (DBType) {
      ERD.store().commit({
        type: 'changeDB',
        DBType: DBType
      })
    }
  },
  mounted () {
    // 이벤트 핸들러에 컴포넌트 등록
    ERD.core.event.components.CanvasMenu = this
    const width = $(window).width()
    const height = $(window).height()
    this.preview.left = (-1 * 5000 / 2) + (150 / 2) + width - 150 - 20
    this.preview.x = width - 150 - 20
    this.preview.target.width = width * 0.03
    this.preview.target.height = height * 0.03
    this.preview.target.x = window.scrollX / ERD.core.event.preview.ratio
    this.preview.target.y = window.scrollY / ERD.core.event.preview.ratio
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
  $tab_color: #424242;
  $tab_active: #282828;
  $menu_base_size: 30px;

  .menu_canvas {

    .menu_top {
      width: 100%;
      height: $menu_base_size;
      position: fixed;
      left: $menu_base_size;
      z-index: 2147483647;
      background-color: black;

      li {
        height: $menu_base_size;
        display: inline-flex;
      }

      .buttons {
        background-color: $tab_color;
        padding-right: 5px;
      }

      .tab_active {
        background-color: $tab_active;

        button {
          background-color: $tab_active;
        }
      }

      button {
        width: 17px;
        height: 17px;
        font-size: .70em;
        margin-top: 8px;
        border: none;
        outline: none;
        cursor: pointer;
        border-radius: 50%;
        /*color: #575a5f;*/
        color: #b9b9b9;
        /*background-color: #575a5f;*/
        background-color: $tab_color;
        /*box-shadow: 1px 1px 1px 1px #171717;*/

        &:hover {
          color: white;
          font-size: .875em;
          margin-top: 7.5px;
        }
      }

      input {
        padding: 10px;
        width: 150px;
        background-color: $tab_color;
      }
    }

    .menu_sidebar {
      width: $menu_base_size;
      height: 100%;
      position: fixed;
      z-index: 2147483647;
      color: white;
      background-color: black;

      & > li {
        text-align: center;
        padding: 10px;
        cursor: pointer;

        ol {
          display: none;
          position: fixed;
          left: $menu_base_size;
          top: 0;
          background-color: black;

          li {
            padding: 10px;
            color: #a2a2a2;

            &:hover {
              color: white;
              background-color: #383d41;
            }
          }

          .db_active {
            color: white;
            background-color: #383d41;
          }
        }

        &:hover {
          ol {
            display: block;
          }
        }
      }
    }

    .preview {
      position: fixed;
      z-index: 2147483647;
      transform: scale(0.03, 0.03);
      overflow: hidden;
    }
    .preview_border {
      width: 150px;
      height: 150px;
      position: fixed;
      z-index: 2147483647;
      box-shadow: 1px 1px 6px 2px #171717;
      .preview_target {
        position: absolute;
        border: solid orange 1px;
      }
    }

    .ghost {
      opacity: 0.5;
    }
  }
</style>
