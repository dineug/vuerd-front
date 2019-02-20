<template lang="pug">
  .grid_canvas
    ul.menu_bottom
      li(v-for="menu in menus" :key="menu.id" :title="menu.name"
      @click="menuAction(menu.type)")
        font-awesome-icon(:icon="menu.icon")

    grid.table_detail(v-if="isTable"
    :options="optionsTableDetail" theme="clean"
    :columnData="columnDataTableDetail"
    :rowData="rowDataDataTableDetail")
</template>

<script>
import 'tui-grid/dist/tui-grid.css'
import Grid from '@toast-ui/vue-grid/src/Grid'
import storeTable from '@/store/editor/table'
import ERD from '@/js/editor/ERD'
import gridTableDetail from '@/js/editor/config/gridTableDetail'
import $ from 'jquery'

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
      optionsTableDetail: gridTableDetail.options,
      columnDataTableDetail: gridTableDetail.columnData
    }
  },
  computed: {
    rowDataDataTableDetail () {
      return storeTable.state.rows
    }
  },
  methods: {
    menuAction (type) {
      switch (type) {
        case 'table':
          this.isTable = !this.isTable
          ERD.core.event.isGrid.table = this.isTable
          break
      }
    }
  },
  mounted () {
    ERD.core.event.components.CanvasGrid = this
  },
  updated () {
    if (ERD.core.event.isGrid.table) {
      this.isTable = true
      if (storeTable.state.table) {
        $('.tui-grid-head-area:eq(1)').find('tr:eq(0) > th').text(storeTable.state.table.name)
      } else {
        $('.tui-grid-head-area:eq(1)').find('tr:eq(0) > th').text('')
      }
    }
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
      z-index: 2147483646;
      color: white;
      background-color: black;

      li {
        padding: 10px;
        cursor: pointer;
        display: inline-block;
      }
    }

    .table_detail {
      position: fixed;
      bottom: $menu_base_size;
      left: $menu_base_size;
      z-index: 2147483646;
    }
  }
</style>
