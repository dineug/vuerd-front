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
        .modal_body(:style="type === 'help' ? 'width: 530px;' : ''")
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
            span(v-html="`right click${space(18)}- QuickMenu`")
            span(v-html="`Ctrl + Enter${space(6)}- Hint Choice`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`Ctrl + Z${space(23)}- Undo`")
            span(v-html="`Ctrl + Shift + Z - Redo`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`ESC${space(29)}- Event All stop`")
            span(v-html="`Ctrl + 1 - 9${space(8)} - Model Choice`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`Ctrl + Shift + Delete - Model delete`")
            span(v-html="`Arrow key${space(7)} - Model focus move`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`drag${space(27)}- Model move`")

          .modal_title.help(v-if="type === 'help'") table, memo
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`Ctrl + drag${space(16)}- multi selected`")
            span(v-html="`Ctrl + click${space(8)}- multi selected`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`Ctrl + A${space(22)}- selected All`")
            span(v-html="`Ctrl + Delete${space(4)}- delete`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`drag${space(26)}- move`")
            span(v-html="`Arrow key${space(8)}- focus move`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`Enter${space(25)}- edit on/off`")
            span(v-html="`Alt + Enter${space(8)}- column add`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`Alt + Delete${space(14)}- column delete`")
            span(v-html="`drag${space(18)}- column move`")

          .modal_title.help(v-if="type === 'help'") Canvas
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`drag${space(26)}- move`")
            span(v-html="`preview drag${space(3)}- move`")

          .modal_title.help(v-if="type === 'help'") QuickMenu
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`Alt + N${space(22)}- New Model`")
            span(v-html="`Alt + T${space(15)}- New Table`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`Alt + M${space(22)} - New Memo`")
            span(v-html="`Alt + K${space(15)}- Primary key`")
          .modal_content.help(v-if="type === 'help'")
            span(v-html="`Alt + 1${space(23)}- 1 : 1`")
            span(v-html="`Alt + 2${space(16)}- 1 : N`")
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
    },
    space (n) {
      const buffer = []
      for (let i = 0; i < n; i++) {
        if (i % 2 === 0) {
          buffer.push('&nbsp;')
        } else {
          buffer.push(' ')
        }
      }
      return buffer.join('')
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
          font-size: 14px;

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
              margin-left: 10px;
            }
          }
        }
      }
    }
  }
</style>
