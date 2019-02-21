<template lang="pug">
  .tui_grid(ref="tuiGrid")
</template>
<script>
import Grid from 'tui-grid'

const gridEvents = [
  'beforeRequest',
  'check',
  'click',
  'collapsed',
  'collapsedAll',
  'dblclick',
  'deleteRange',
  'errorResponse',
  'expanded',
  'expandedAll',
  'failResponse',
  'focusChange',
  'mousedown',
  'mouseout',
  'mouseover',
  'response',
  'selection',
  'successResponse',
  'uncheck'
]

const presetTheme = [
  'default',
  'striped',
  'clean'
]

const presetLanguage = [
  'en',
  'ko'
]

export default {
  name: 'TuiGrid',
  props: {
    rowData: {
      type: Array,
      required: true
    },
    columnData: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      default () {
        return {}
      }
    },
    theme: {
      type: [String, Object],
      validator (value) {
        let result = false
        if (typeof value === 'string') {
          result = presetTheme.indexOf(value) > -1
        } else {
          result = value.hasOwnProperty('name') && value.hasOwnProperty('value')
        }

        return result
      }
    },
    language: {
      type: [String, Object],
      validator (value) {
        let result = false
        if (typeof value === 'string') {
          result = presetLanguage.indexOf(value) > -1
        } else {
          result = value.hasOwnProperty('name') && value.hasOwnProperty('value')
        }

        return result
      }
    }
  },
  data () {
    return {
      gridInstance: null
    }
  },
  watch: {
    rowData (newData) {
      this.invoke('setData', newData)
    },
    columnData (newColumns) {
      this.invoke('setColumns', newColumns)
    }
  },
  mounted () {
    const options = Object.assign({}, this.options, {
      el: this.$refs.tuiGrid,
      data: this.rowData,
      columns: this.columnData
    })
    this.gridInstance = new Grid(options)
    this.addEventListeners()
    this.applyTheme()
    this.setLanguage()
  },
  destroyed () {
    gridEvents.forEach(eventName => this.gridInstance.off(eventName))
    this.gridInstance.destroy()
  },
  methods: {
    addEventListeners () {
      gridEvents.forEach(eventName => {
        this.gridInstance.on(eventName, (...args) => this.$emit(eventName, ...args))
      })
    },
    applyTheme () {
      if (this.theme) {
        if (typeof this.theme === 'string') {
          Grid.applyTheme(this.theme)
        } else {
          Grid.applyTheme(this.theme.name, this.theme.value)
        }
      }
    },
    setLanguage () {
      if (this.language) {
        if (typeof this.language === 'string') {
          Grid.setLanguage(this.language)
        } else {
          Grid.setLanguage(this.language.name, this.language.value)
        }
      }
    },
    getRootElement () {
      return this.$refs.tuiGrid
    },
    invoke (methodName, ...args) {
      let result
      if ((methodName === 'setData' || methodName === 'resetData') && args.length > 0) {
        const clonedData = JSON.parse(JSON.stringify(args[0]))
        if (args.length > 1) {
          this.gridInstance[methodName](clonedData, args[1])
        } else {
          this.gridInstance[methodName](clonedData)
        }
      } else if (this.gridInstance[methodName]) {
        result = this.gridInstance[methodName](...args)
      }

      return result
    }
  }
}
</script>

<style lang="scss">
  .tui_grid {
    .Checkbox_checkbox {
      position: relative;
      display: inline-block
    }

    .Checkbox_checkbox+.Checkbox_checkbox {
      margin-left: 36px
    }

    .Checkbox_checkbox+.Checkbox_checkbox:first-child {
      margin-left: 0
    }

    .Checkbox_input[type=checkbox] {
      display: none;
      box-sizing: border-box
    }

    .Checkbox_indicator {
      cursor: pointer;
      position: relative;
      padding: 0;
      display: inline;
      display: -ms-flexbox;
      display: flex
    }

    .Checkbox_indicator:before {
      transition: .2s ease-out;
      content: "";
      width: 16px;
      height: 16px;
      display: inline-block;
      background: #f7f9f9;
      border: 1px solid #ddd;
      border-radius: 2px;
      vertical-align: middle;
    }

    .Checkbox_indicator:after {
      transition: .2s ease-out;
      content: "";
      position: absolute;
      width: 5px;
      height: 8px;
      top: 3px;
      left: 6px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg)
    }

    .Checkbox_label {
      margin-left: 8px;
      margin-top: 8px;
      color: #242727
    }

    input[type=checkbox][disabled]~.Checkbox_indicator {
      opacity: .4;
      cursor: not-allowed
    }

    input[type=checkbox]:checked~.Checkbox_indicator:before {
      background: #3b7b8f;
      border: 1px solid #3b7b8f;
    }

    input[type=checkbox]:checked~.Checkbox_indicator.Checkbox_isTypeSecondary:before {
      background: #39a898;
      border: 1px solid #39a898
    }

    input[type=checkbox]~.Checkbox_indicator:after {
      visibility: hidden
    }

    input[type=checkbox]:checked~.Checkbox_indicator:after {
      visibility: visible;
      visibility: initial;
    }

    input[type=checkbox]+.Checkbox_indicator+.Checkbox_label {
      font-weight: 700;
      color: #648089
    }

    input[type=checkbox]:checked+.Checkbox_indicator+.Checkbox_label {
      font-weight: 700;
      color: #242727
    }

    input[type=checkbox]+.Checkbox_indicator>.Checkbox_label, input[type=checkbox]:checked+.Checkbox_indicator>.Checkbox_label {
      font-weight: 500;
      color: #242727
    }

    input[type=checkbox]+.Checkbox_indicator.Checkbox_isTypeSecondary>.Checkbox_label {
      font-weight: 700;
      color: #648089
    }

    input[type=checkbox]:checked+.Checkbox_indicator.Checkbox_isTypeSecondary>.Checkbox_label {
      font-weight: 700;
      color: #242727
    }
  }
</style>
