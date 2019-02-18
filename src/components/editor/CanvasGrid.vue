<template lang="pug">
  .grid_canvas
    ul.menu_bottom
      li(v-for="menu in menus" :key="menu.id" :title="menu.name"
      @click="menuAction(menu.type)")
        font-awesome-icon(:icon="menu.icon")

    grid.table_detail(v-if="isTable"
    :options="optionsColumns" theme="clean"
    :columnData="columns"
    :rowData="rowColumns")
</template>

<script>
import 'tui-grid/dist/tui-grid.css'
import Grid from '@toast-ui/vue-grid/src/Grid'
import * as util from '@/js/editor/util'
import storeTable from '@/store/editor/table'
import ERD from '@/js/editor/ERD'

export default {
  name: 'CanvasGrid',
  components: {
    Grid
  },
  data () {
    return {
      isTable: false,
      menus: [
        {
          type: 'table',
          icon: 'list',
          name: 'table options'
        }
      ],
      optionsColumns: {
        header: {
          height: 50,
          complexColumns: [
            {
              title: '',
              name: 'table',
              childNames: ['name', 'dataType', 'primaryKey', 'notNull', 'unique', 'autoIncrement', 'default', 'comment']
            }
          ]
        },
        scrollX: false,
        // scrollY: false,
        bodyHeight: 160,
        rowHeaders: ['rowNum']
      },
      columns: [
        {
          title: 'Column Name',
          name: 'name',
          onBeforeChange: ev => {
            storeTable.commit({
              type: 'sync',
              rowKey: ev.rowKey,
              column: {
                name: ev.value
              }
            })
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
            storeTable.commit({
              type: 'sync',
              rowKey: ev.rowKey,
              column: {
                dataType: ev.value
              }
            })
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
            storeTable.commit({
              type: 'sync',
              rowKey: ev.rowKey,
              isPK: true,
              column: {
                options: {
                  primaryKey: ev.value ? ev.value : false
                },
                ui: {
                  pk: ev.value ? ev.value : false
                }
              }
            })
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
            storeTable.commit({
              type: 'sync',
              rowKey: ev.rowKey,
              column: {
                options: {
                  notNull: ev.value ? ev.value : false
                }
              }
            })
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
            storeTable.commit({
              type: 'sync',
              rowKey: ev.rowKey,
              column: {
                options: {
                  unique: ev.value ? ev.value : false
                }
              }
            })
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
            storeTable.commit({
              type: 'sync',
              rowKey: ev.rowKey,
              column: {
                options: {
                  autoIncrement: ev.value ? ev.value : false
                }
              }
            })
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
            storeTable.commit({
              type: 'sync',
              rowKey: ev.rowKey,
              column: {
                default: ev.value
              }
            })
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
            storeTable.commit({
              type: 'sync',
              rowKey: ev.rowKey,
              column: {
                comment: ev.value
              }
            })
          },
          editOptions: {
            type: 'text',
            useViewMode: true
          }
        }
      ]
    }
  },
  computed: {
    rowColumns () {
      return storeTable.state.rows
    }
  },
  methods: {
    menuAction (type) {
      switch (type) {
        case 'table':
          this.isTable = !this.isTable
          break
      }
    }
  },
  mounted () {
    ERD.core.event.components.CanvasGrid = this
  }
}
</script>

<style lang="scss" scoped>
  $menu_base_size: 30px;

  .grid_canvas {
    .menu_bottom {
      width: 100%;
      height: $menu_base_size;
      position: fixed;
      bottom: 0;
      left: $menu_base_size;
      z-index: 2147483647;
      color: white;
      background-color: black;

      li {
        padding: 10px;
        cursor: pointer;
      }
    }

    .table_detail {
      position: fixed;
      bottom: $menu_base_size;
      left: $menu_base_size;
      z-index: 2147483647;
    }
  }
</style>
