<template lang="pug">
  .erd_grid
    table
      thead
        tr
          th(:colspan="columnData.length")
            .table_resize(@mousedown="resize")
            button.close(@click="close" title="ESC")
              font-awesome-icon(icon="times")
            //button.add
              font-awesome-icon(icon="plus")

        tr
          th(v-for="column in columnData" :style="style(column)") {{ column.name }}
    .table_wrapper(:style="`height: ${reHeight}px;`")
      table
        tbody
          tr(v-for="(entry, col) in data" :index="col")
            td(v-for="(column, row) in columnData"
            :style="style(column)"
            :class="{ edit: !entry.ui[`isRead${column.key}`] && entry.ui[`isRead${column.key}`] !== undefined }")
              input(:type="type(column)" :value="entry[column.key]" :index="row"
              :class="{ edit: !entry.ui[`isRead${column.key}`] && entry.ui[`isRead${column.key}`] !== undefined }"
              :checked="type(column) === 'checkbox' && entry[column.key]"
              :readonly="entry.ui[`isRead${column.key}`]"
              spellcheck="false"
              :placeholder="column.name"
              @keyup.enter="onEnterEditor($event, entry.ui[`isRead${column.key}`], column.key, entry.id)"
              @dblclick="onEnterEditor($event, entry.ui[`isRead${column.key}`], column.key, entry.id)"
              @keydown="onKeyArrowMove($event, entry.ui[`isRead${column.key}`])"
              @keydown.9="lastTabFocus($event, row === columnData.length - 1)"
              @focus="onFocus($event, type(column) === 'checkbox')"
              @blur="onBlur($event, type(column) === 'checkbox')"
              @change="change($event, column.key, entry.id)")
</template>

<script>
import ERD from '@/js/editor/ERD'
import table from '@/store/editor/table'

export default {
  name: 'Grid',
  props: {
    columnData: {
      type: Array,
      default: () => {
        return []
      }
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      height: 100
    }
  },
  computed: {
    reHeight () {
      const maxHeight = 25 * this.data.length
      if (this.height > maxHeight) {
        return maxHeight + 1
      }
      return this.height + 1
    }
  },
  methods: {
    style (option) {
      const buffer = []
      if (option.width) {
        buffer.push(`width: ${option.width}%`)
      }
      return buffer.join('')
    },
    type (option) {
      return option.type ? option.type : 'text'
    },
    resize () {
      ERD.core.event.onGridResize('start', 'column')
    },
    close () {
      this.$emit('close')
    },
    onKeyArrowMove (e, isRead) {
      if (isRead || isRead === undefined) {
        const tbody = e.target.parentNode.parentNode.parentNode
        const trs = tbody.querySelectorAll('tr')
        const tr = e.target.parentNode.parentNode
        const inputs = tr.querySelectorAll('input')
        const rowIndex = Number(e.target.getAttribute('index'))
        const colIndex = Number(tr.getAttribute('index'))
        const len = trs.length
        switch (e.keyCode) {
          case 38: // key: Arrow up
            e.preventDefault()
            trs[colIndex - 1 < 0 ? len - 1 : colIndex - 1].querySelectorAll('input')[rowIndex].focus()
            break
          case 40: // key: Arrow down
            e.preventDefault()
            trs[colIndex + 1 === len ? 0 : colIndex + 1].querySelectorAll('input')[rowIndex].focus()
            break
          case 37: // key: Arrow left
            e.preventDefault()
            trs[colIndex].querySelectorAll('input')[rowIndex - 1 < 0 ? inputs.length - 1 : rowIndex - 1].focus()
            break
          case 39: // key: Arrow right
            e.preventDefault()
            trs[colIndex].querySelectorAll('input')[rowIndex + 1 === inputs.length ? 0 : rowIndex + 1].focus()
            break
        }
      }
    },
    onFocus (e, isCheckbox) {
      if (isCheckbox) {
        e.target.parentNode.classList.add('selected')
      }
    },
    onBlur (e, isCheckbox) {
      if (isCheckbox) {
        e.target.parentNode.classList.remove('selected')
      }
    },
    lastTabFocus (e, isLast) {
      if (isLast) {
        e.preventDefault()
        const tbody = e.target.parentNode.parentNode.parentNode
        const trs = tbody.querySelectorAll('tr')
        const tr = e.target.parentNode.parentNode
        const colIndex = Number(tr.getAttribute('index'))
        const len = trs.length
        if (colIndex === len - 1) {
          trs[0].querySelector('input').focus()
        } else {
          trs[colIndex + 1].querySelector('input').focus()
        }
      }
    },
    onEnterEditor (e, isRead, current, columnId) {
      if (!e.altKey && isRead !== undefined) {
        if (!e.ctrlKey) {
          table.commit({
            type: 'edit',
            columnId: columnId,
            current: `isRead${current}`,
            isRead: !isRead
          })
        }
      } else if (e.target.getAttribute('type') === 'checkbox') {
        e.target.checked = !e.target.checked
        this.change(e, current, columnId)
      }
    },
    change (e, current, columnId) {
      const column = {}
      const columnGrid = {}
      columnGrid[current] = e.target.value
      if (e.target.getAttribute('type') === 'checkbox') {
        column.options = {}
        column.options[current] = e.target.checked
        columnGrid[current] = e.target.checked
      } else {
        column[current] = e.target.value
      }
      table.commit({
        type: 'sync',
        columnId: columnId,
        isPK: current === 'primaryKey',
        column: column,
        columnGrid: columnGrid
      })
    }
  },
  mounted () {
    ERD.core.event.components.Grid.column = this
  }
}
</script>

<style lang="scss" scoped>
  $selected: #00a9ff;

  .erd_grid {
    bottom: 0;
    width: 100%;
    background-color: #191919;

    .table_resize {
      width: 100%;
      height: 10px;
      position: absolute;
      top: 0;
      cursor: ns-resize;
    }

    .table_wrapper {
      overflow: auto;
      overflow-x: hidden;

      /* width */
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      /* Track */
      &::-webkit-scrollbar-track {
        background: #191919;
        border-left: 1px solid  #191919;
      }
      /* Handle */
      &::-webkit-scrollbar-thumb {
        background: #aaa;
      }
      /* Handle : hover*/
      &::-webkit-scrollbar-thumb:hover {
        background: white;
      }
    }

    input, textarea {
      background-color: #191919;
      color: white;
    }

    input:focus {
      border-bottom: solid $selected 1px;
      &.edit {
        border-bottom: solid greenyellow 1px;
      }
    }

    input[type=text] {
      width: 100%;
    }

    table {
      width: 100%;
      height: 100%;
      background-color: #191919;
      color: white;
      min-width: 400px;

      th {
        padding: 10px 10px;
        text-align: center;

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

          &.close {
            color: #9B0005;
            background-color: #9B0005;
          }
          &.add {
            color: #009B2E;
            background-color: #009B2E;
          }

          &:hover {
            color: white;
          }
        }
      }
      td {
        padding: 5px 10px;
        text-align: center;

        &.selected {
          border-left: solid $selected 3px;
        }
      }
    }
  }
</style>
