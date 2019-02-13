<template lang="pug">
  .grid_canvas
    .menu_bottom

    grid.table_detail(:options="options" theme="clean"
    :columnData="columns.columns"
    :rowData="columns.rows")
</template>

<script>
import 'tui-grid/dist/tui-grid.css'
import Grid from '@toast-ui/vue-grid/src/Grid'
import ERD from '@/js/editor/ERD'
import * as util from '@/js/editor/util'

export default {
  name: 'CanvasGrid',
  components: {
    Grid
  },
  data () {
    return {
      options: {
        scrollX: false,
        // scrollY: false,
        bodyHeight: 100,
        rowHeaders: ['rowNum']
      },
      columns: {
        rows: [],
        columns: [
          {
            title: 'Column Name',
            name: 'name',
            onBeforeChange: ev => {
              // ev.columnName
              // ev.rowKey
              // ev.value
              console.log('Before change:' + ev.value)
            },
            editOptions: {
              type: 'text',
              useViewMode: true
            }
          },
          {
            title: 'DataType',
            name: 'dataType',
            onBeforeChange: ev => {
              console.log('Before change:' + ev.value)
            },
            editOptions: {
              type: 'text',
              useViewMode: true
            }
          },
          {
            title: 'PK',
            name: 'primaryKey',
            width: 50,
            onBeforeChange: ev => {
              console.log('Before change:' + ev.value)
            },
            editOptions: {
              type: 'checkbox',
              listItems: [
                { text: util.svgCheck, value: true }
              ],
              useViewMode: true
            }
          },
          {
            title: 'NN',
            name: 'notNull',
            width: 50,
            onBeforeChange: ev => {
              console.log('Before change:' + ev.value)
            },
            editOptions: {
              type: 'checkbox',
              listItems: [
                { text: util.svgCheck, value: true }
              ],
              useViewMode: true
            }
          },
          {
            title: 'UQ',
            name: 'unique',
            width: 50,
            onBeforeChange: ev => {
              console.log('Before change:' + ev.value)
            },
            editOptions: {
              type: 'checkbox',
              listItems: [
                { text: util.svgCheck, value: true }
              ],
              useViewMode: true
            }
          },
          {
            title: 'UN',
            name: 'unsigned',
            width: 50,
            onBeforeChange: ev => {
              console.log('Before change:' + ev.value)
            },
            editOptions: {
              type: 'checkbox',
              listItems: [
                { text: util.svgCheck, value: true }
              ],
              useViewMode: true
            }
          },
          {
            title: 'AI',
            name: 'autoIncrement',
            width: 50,
            onBeforeChange: ev => {
              console.log('Before change:' + ev.value)
            },
            editOptions: {
              type: 'checkbox',
              listItems: [
                { text: util.svgCheck, value: true }
              ],
              useViewMode: true
            }
          },
          {
            title: 'Default',
            name: 'default',
            onBeforeChange: ev => {
              console.log('Before change:' + ev.value)
            },
            editOptions: {
              type: 'text',
              useViewMode: true
            }
          },
          {
            title: 'Comment',
            name: 'comment',
            onBeforeChange: ev => {
              console.log('Before change:' + ev.value)
            },
            editOptions: {
              type: 'text',
              useViewMode: true
            }
          }
        ]
      }
    }
  },
  mounted () {
    ERD.core.event.components.CanvasGrid = this
  }
}
</script>

<style lang="scss">
  $menu_base_size: 30px;

  .grid_canvas {
    .menu_bottom {
      width: 100%;
      height: $menu_base_size;
      position: fixed;
      bottom: 0;
      left: $menu_base_size;
      z-index: 2147483647;
      background-color: black;
    }

    .table_detail {
      width: 800px;
      position: fixed;
      bottom: $menu_base_size;
      left: $menu_base_size;
      z-index: 2147483647;
    }
  }
</style>
