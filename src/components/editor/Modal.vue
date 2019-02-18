<template lang="pug">
    .modal
      .modal_background
      .modal_box
        .modal_btn
          button(title="ESC"
          @click="onClose")
            font-awesome-icon(icon="times")
        .modal_head
          h3 view setting
        .modal_body
          .modal_title canvas size
          .modal_content
            span x
            input(type="text" v-model="CANVAS_WIDTH"
            @change="onChangeCanvasWidth")
            span y
            input(type="text" v-model="CANVAS_HEIGHT"
            @change="onChangeCanvasHeight")
</template>

<script>
import ERD from '@/js/editor/ERD'

export default {
  name: 'Modal',
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
        }
      }
    }
  }
</style>
