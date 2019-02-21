<template lang="pug">
  .grid_canvas
    ul.menu_bottom
      li(v-for="menu in menus" :key="menu.id" :title="menu.name"
      @click="menuAction(menu.type)")
        font-awesome-icon(:icon="menu.icon")

    // 테이블 상세 옵션
    grid.table_detail(v-if="isTable"
    :options="optionsTableDetail" theme="clean"
    :columnData="columnDataTableDetail"
    :rowData="rowDataTableDetail")

    // 도메인
    .domain(v-if="isDomain")
      .domain_top
        button(@click="domainAdd")
          font-awesome-icon(icon="plus")

        button(@click="domainDelete")
          font-awesome-icon(icon="times")

      grid.domain_body(theme="clean" ref="gridDomain"
      :options="optionsDomain"
      :columnData="columnDataDomain"
      :rowData="rowDataDomain")
</template>

<script>
import 'tui-grid/dist/tui-grid.css'
import Grid from './Grid'
import storeTable from '@/store/editor/table'
import ERD from '@/js/editor/ERD'
import gridTableDetail from '@/js/editor/config/gridTableDetail'
import gridDomain from '@/js/editor/config/gridDomain'
import $ from 'jquery'

export default {
  name: 'CanvasGrid',
  components: {
    Grid
  },
  data () {
    return {
      isTable: false,
      isDomain: false,
      menus: [
        {
          type: 'table',
          icon: 'list',
          name: 'table options'
        },
        {
          type: 'domain',
          icon: 'book',
          name: 'domain'
        }
      ],
      optionsTableDetail: gridTableDetail.options,
      columnDataTableDetail: gridTableDetail.columnData,
      optionsDomain: gridDomain.options,
      columnDataDomain: gridDomain.columnData
    }
  },
  computed: {
    rowDataTableDetail () {
      return storeTable.state.rows
    },
    rowDataDomain () {
      return ERD.store().state.domains
    }
  },
  methods: {
    menuAction (type) {
      switch (type) {
        case 'table':
          this.isTable = !this.isTable
          this.isDomain = false
          ERD.core.event.isGrid.table = this.isTable
          break
        case 'domain':
          this.isDomain = !this.isDomain
          this.isTable = false
          ERD.core.event.isGrid.table = false
          break
      }
    },
    // 도메인 추가
    domainAdd () {
      ERD.store().commit({ type: 'domainAdd' })
    },
    // 도메인 삭제
    domainDelete () {
      const rows = this.$refs.gridDomain.gridInstance.getCheckedRows()
      rows.forEach(row => {
        ERD.store().commit({
          type: 'domainDelete',
          id: row.id
        })
      })
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

    .domain {
      .domain_top {
        position: fixed;
        bottom: 240px;
        left: $menu_base_size;
        z-index: 2147483646;
        color: white;
        button {
          width: 17px;
          height: 17px;
          font-size: .70em;
          margin-left: 5px;
          border: none;
          outline: none;
          cursor: pointer;
          border-radius: 50%;

          &:first-child {
            color: #009B2E;
            background-color: #009B2E;
          }
          &:last-child {
            color: #9B0005;
            background-color: #9B0005;
          }

          &:hover {
            color: white;
          }
        }
      }
      .domain_body {
        position: fixed;
        bottom: $menu_base_size;
        left: $menu_base_size;
        z-index: 2147483646;
      }
    }
  }
</style>
