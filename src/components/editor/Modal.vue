<template lang="pug">
    .modal
      .modal_background
      .modal_box
        .modal_btn
          button(title="ESC"
          @click="onClose")
            font-awesome-icon(icon="times")
        .modal_head
          h3(v-if="type === 'view'") view setting
          h3(v-if="type === 'help'") help
        .modal_body
          .modal_title(v-if="type === 'view'") canvas size
          .modal_content(v-if="type === 'view'")
            span x
            input(type="text" v-model="CANVAS_WIDTH"
            @change="onChangeCanvasWidth")
            span y
            input(type="text" v-model="CANVAS_HEIGHT"
            @change="onChangeCanvasHeight")

          .modal_title.help(v-if="type === 'help'") base
          .modal_content.help(v-if="type === 'help'")
            span QuickMenu - mouse right click
            span Hint Choice - Ctrl + Enter
          .modal_content.help(v-if="type === 'help'")
            span Undo - Ctrl + Z
            span Redo - Ctrl + Shift + Z
          .modal_content.help(v-if="type === 'help'")
            span Event All stop - ESC
            span Model Choice - Ctrl + 1 ~ 9
          .modal_content.help(v-if="type === 'help'")
            span model delete - Ctrl + Shift + Delete
            span model move - Arrow key
          .modal_title.help(v-if="type === 'help'") table, memo
          .modal_content.help(v-if="type === 'help'")
            span multi selected - Ctrl + drag
            span multi selected - Ctrl + click
          .modal_content.help(v-if="type === 'help'")
            span selected All - Ctrl + A
            span delete - Ctrl + Delete
          .modal_content.help(v-if="type === 'help'")
            span move - drag
            span focus move - Arrow key
          .modal_content.help(v-if="type === 'help'")
            span edit on/off - Enter
            span column add - Alt + Enter
          .modal_content.help(v-if="type === 'help'")
            span column delete - Alt + Delete
            span column move - drag
          .modal_title.help(v-if="type === 'help'") Canvas
          .modal_content.help(v-if="type === 'help'")
            span move - drag
            span move - preview drag
          .modal_title.help(v-if="type === 'help'") QuickMenu
          .modal_content.help(v-if="type === 'help'")
            span New Model - Alt + N
            span New Table - Alt + T
          .modal_content.help(v-if="type === 'help'")
            span New Memo - Alt + M
            span Primary key - Alt + K
          .modal_content.help(v-if="type === 'help'")
            span 1 : 1 - Alt + 1
            span 1 : N - Alt + 2
</template>

<script>
import ERD from '@/js/editor/ERD'

export default {
  name: 'Modal',
  props: {
    type: {
      type: String,
      default: 'view'
    }
  },
  data () {
    return {
      CANVAS_WIDTH: ERD.store().state.CANVAS_WIDTH,
      CANVAS_HEIGHT: ERD.store().state.CANVAS_HEIGHT
    }
  },
  watch: {
    CANVAS_WIDTH (val, oldVal) {
      if (isNaN(val)) {
        this.CANVAS_WIDTH = oldVal
      }
    },
    CANVAS_HEIGHT (val, oldVal) {
      if (isNaN(val)) {
        this.CANVAS_HEIGHT = oldVal
      }
    }
  },
  methods: {
    onChangeCanvasWidth () {
      if (this.CANVAS_WIDTH < 2000) {
        this.CANVAS_WIDTH = 2000
      }
      ERD.store().commit({
        type: 'setConfig',
        config: {
          CANVAS_WIDTH: this.CANVAS_WIDTH
        }
      })
    },
    onChangeCanvasHeight () {
      if (this.CANVAS_HEIGHT < 2000) {
        this.CANVAS_HEIGHT = 2000
      }
      ERD.store().commit({
        type: 'setConfig',
        config: {
          CANVAS_HEIGHT: this.CANVAS_HEIGHT
        }
      })
    },
    onClose () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
  .modal {
    .modal_background {
      position: fixed;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      background-color: #848484;
      opacity: 0.5;
    }

    .modal_box {
      position: fixed;
      z-index: 2147483647;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background-color: #1b1b1b;
      color: white;

      input {
        background-color: #484848;
        color: white;
        height: 20px;
      }

      .modal_btn {
        padding: 10px;
        button {
          width: 17px;
          height: 17px;
          font-size: .70em;
          float: right;
          margin-left: 5px;
          border: none;
          outline: none;
          cursor: pointer;
          border-radius: 50%;

          &:first-child {
            color: #9B0005;
            background-color: #9B0005;
          }
          &:hover {
            color: white;
          }
        }
      }

      .modal_head {
        font-size: 24px;
        padding: 10px;
      }
      .modal_body {
        padding: 10px;
        .modal_title {
          font-size: 20px;
          padding: 5px;

          &.help {
            margin-top: 20px;
            margin-bottom: 5px;
          }
        }
        .modal_content {
          padding: 5px;
          font-size: 15px;

          span, input {
            margin-right: 10px;
          }
          input {
            width: 100px;
          }

          &.help {
            span {
              display: inline-block;
              width: 240px;
            }
          }
        }
      }
    }
  }
</style>
