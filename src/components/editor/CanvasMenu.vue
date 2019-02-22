<template lang="pug">
  .menu_canvas
    // 메뉴 top
    draggable.menu_top(element="ul" v-model="model.tabs" :options="{group:'tab', ghostClass: 'ghost'}")
      transition-group(type="transition" name="menu-top")

        li(v-for="(tab, i) in model.tabs" :key="tab.id")
          input(v-model="tab.name" :readonly="tab.ui.isReadName" v-focus :id="`tab_${tab.id}`"
          :class="{ tab_active: tab.active, edit: !tab.ui.isReadName }"
          type="text" :title="i < 9 ? `Ctrl + ${i+1}` : ''"
          @keydown="onKeyArrowMove($event, tab.ui.isReadName)"
          @keyup.enter="onEnterEditor($event, tab.ui.isReadName, tab.id)"
          @dblclick="onEnterEditor($event, tab.ui.isReadName, tab.id)"
          @focus="modelActive(tab.id)"
          @blur="onBlur")

          span.buttons(:class="{ tab_active: tab.active }")
            button(@click="modelDelete(tab.id)" title="Ctrl + Shift + Delete")
              font-awesome-icon(icon="times")

    // 메뉴 sidebar left
    ul.menu_sidebar
      li(v-for="menu in menus" :key="menu.id" :title="menu.name"
      :class="{ undo_none: menu.type === 'undo' && !isUndo, redo_none: menu.type === 'redo' && !isRedo }"
      @click="menuAction(menu.type)")
        font-awesome-icon(:icon="menu.icon")
        ol(v-if="menu.type === 'DBType'")
          li(v-for="dbType in DBTypes" :class="{ db_active: DBType === dbType }"
          @click="changeDB(dbType)") {{ dbType }}

    // 메뉴 sidebar right
    <!--ui.menu_sidebar_right-->
      <!--li(v-for="menu in menus" :key="menu.id" :title="menu.name"-->
      <!--:class="{ undo_none: menu.type === 'undo' && !isUndo, redo_none: menu.type === 'redo' && !isRedo }"-->
      <!--@click="menuAction(menu.type)")-->
        <!--font-awesome-icon(:icon="menu.icon")-->

    // 메뉴 Preview Navigation
    canvas-main.preview(:style="`top: ${preview.top}px; left: ${preview.left}px; transform: scale(${previewRatio}, ${previewRatio});`"
    :isPreview="true")
    .preview_border(:style="`top: ${preview.y}px; left: ${preview.x}px; width: ${PREVIEW_WIDTH}px; height: ${CANVAS_HEIGHT * previewRatio}px;`")
      .preview_target(:style="`top: ${preview.target.y}px; left: ${preview.target.x}px; width: ${preview.target.width}px; height: ${preview.target.height}px;`"
      @mousedown="onPreview")

    // view 셋팅 팝업
    modal(v-if="isModalView" type="view" @close="onClose('isModalView')")
    modal(v-if="isModalHelp" type="help" @close="onClose('isModalHelp')")
</template>

<script>
import ERD from '@/js/editor/ERD'
import model from '@/store/editor/model'
import draggable from 'vuedraggable'
import CanvasMain from './CanvasMain'
import CanvasSvg from './CanvasSvg'
import Modal from './Modal'
import $ from 'jquery'

export default {
  name: 'CanvasMenu',
  components: {
    draggable,
    CanvasMain,
    CanvasSvg,
    Modal
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
        top: 0,
        left: 0,
        x: 0,
        y: 50,
        target: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      },
      isUndo: false,
      isRedo: false,
      isModalView: false,
      isModalHelp: false,
      DBTypes: [
        'MariaDB',
        'MSSQL',
        'MySQL',
        'Oracle',
        'PostgreSQL'
      ],
      menus: [
        {
          type: 'DBType',
          icon: 'database',
          name: 'DB'
        },
        {
          type: 'save',
          icon: 'cloud-upload-alt',
          name: 'save'
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
          type: 'clone',
          icon: 'copy',
          name: 'clone'
        },
        {
          type: 'view',
          icon: 'eye',
          name: 'view setting'
        },
        {
          type: 'undo',
          icon: 'undo',
          name: 'undo(Ctrl + Z)'
        },
        {
          type: 'redo',
          icon: 'redo',
          name: 'redo(Ctrl + Shift + Z)'
        },
        {
          type: 'help',
          icon: 'question',
          name: 'help'
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
    },
    previewRatio () {
      return ERD.store().state.PREVIEW_WIDTH / ERD.store().state.CANVAS_WIDTH
    },
    CANVAS_WIDTH () {
      return ERD.store().state.CANVAS_WIDTH
    },
    CANVAS_HEIGHT () {
      return ERD.store().state.CANVAS_HEIGHT
    },
    PREVIEW_WIDTH () {
      return ERD.store().state.PREVIEW_WIDTH
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
        case 'clone':
          ERD.core.file.clone()
          break
        case 'view':
          this.isModalView = true
          ERD.core.event.isStop = true
          break
        case 'undo':
          if (this.isUndo) {
            ERD.core.undoRedo.undo()
          }
          break
        case 'redo':
          if (this.isRedo) {
            ERD.core.undoRedo.redo()
          }
          break
        case 'help':
          this.isModalHelp = true
          ERD.core.event.isStop = true
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
    },
    // 미리보기 셋팅
    setPreview () {
      const width = window.innerWidth
      const height = window.innerHeight
      this.preview.left = (-1 * this.CANVAS_WIDTH / 2) + (this.PREVIEW_WIDTH / 2) - this.PREVIEW_WIDTH - 50 + width
      this.preview.top = (-1 * this.CANVAS_HEIGHT / 2) + (this.CANVAS_HEIGHT * this.previewRatio / 2) + 50
      this.preview.x = width - this.PREVIEW_WIDTH - 50
      this.preview.target.width = width * this.previewRatio
      this.preview.target.height = height * this.previewRatio
      this.preview.target.x = window.scrollX * this.previewRatio
      this.preview.target.y = window.scrollY * this.previewRatio
    },
    // modal close
    onClose (type) {
      this[type] = false
      ERD.core.event.isStop = false
    },
    // edit on/off
    onEnterEditor (e, isRead, id) {
      model.commit({
        type: 'modelEdit',
        id: id,
        isRead: !isRead
      })
    },
    // 포커스 out
    onBlur (e) {
      model.commit({ type: 'modelEditAllNone' })
    },
    // 포커스 move
    onKeyArrowMove (e, isRead) {
      if (isRead) {
        const $input = $(e.target).parents('.menu_top').find('input')
        const index = $input.index(e.target)
        switch (e.keyCode) {
          case 37: // key: Arrow left
            e.preventDefault()
            $input.eq(index - 1).focus()
            break
          case 39: // key: Arrow right
            e.preventDefault()
            $input.eq(index + 1 === $input.length ? 0 : index + 1).focus()
            break
        }
      }
      if (e.keyCode === 9) {
        const $input = $(e.target).parents('.menu_top').find('input')
        const index = $input.index(e.target)
        e.preventDefault()
        $input.eq(index + 1 === $input.length ? 0 : index + 1).focus()
      }
    }
  },
  mounted () {
    // 이벤트 핸들러에 컴포넌트 등록
    ERD.core.event.components.CanvasMenu = this
    // 미리보기 셋팅
    this.setPreview()
    // undo, redo 활성화 callback 등록
    ERD.core.undoRedo.callback = () => {
      this.isUndo = ERD.core.undoRedo.getManager().hasUndo()
      this.isRedo = ERD.core.undoRedo.getManager().hasRedo()
    }
  },
  updated () {
    // 미리보기 셋팅
    this.setPreview()
    // undo, redo 활성화
    ERD.core.undoRedo.callback()
  }
}
</script>

<style lang="scss" scoped>
  $tab_color: #424242;
  $tab_active: #282828;
  $selected: #383d41;
  $menu_base_size: 30px;
  $column_selected: #00a9ff;

  .menu_canvas {

    input:focus {
      border-bottom: solid $column_selected 1px;
    }

    input.edit {
      border-bottom: solid greenyellow 1px;
    }

    .menu_top {
      width: 100%;
      height: $menu_base_size;
      position: fixed;
      left: $menu_base_size;
      z-index: 2147483646;
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
        color: white;
        background-color: $tab_color;
      }
    }

    .menu_sidebar {
      width: $menu_base_size;
      height: 100%;
      position: fixed;
      z-index: 2147483646;
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
              background-color: $selected;
            }
          }

          .db_active {
            color: white;
            background-color: $selected;
          }
        }

        &:hover {
          ol {
            display: block;
          }
        }

        &.undo_none, &.redo_none {
          cursor: default;
          color: #a2a2a2;
        }
      }
    }

    .menu_sidebar_right {
      width: $menu_base_size;
      height: 100%;
      position: fixed;
      right: 0;
      z-index: 2147483646;
      color: white;
      background-color: black;
      list-style: none;

      & > li {
        text-align: center;
        padding: 10px;
        cursor: pointer;
      }
    }

    .preview {
      position: fixed;
      z-index: 2147483646;
      overflow: hidden;
    }
    .preview_border {
      position: fixed;
      z-index: 2147483646;
      box-shadow: 1px 1px 6px 2px #171717;
      .preview_target {
        position: absolute;
        border: solid orange 1px;
      }
    }

    /* 이동 animation */
    .menu-top-move {
      transition: transform 0.5s;
    }
    /* 추가,삭제 animation */
    .menu-top-enter-active {
      transition: all .3s ease;
    }
    .menu-top-leave-active {
      transition: all .4s ease-out;
    }
    .menu-top-enter, .menu-top-leave-to {
      transform: translateX(10px);
      opacity: 0;
    }
    .ghost {
      opacity: 0.5;
    }
  }
</style>
