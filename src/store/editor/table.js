import JSLog from '@/js/JSLog'
import Vue from 'vue'
import Vuex from 'vuex'
import ERD from '@/js/editor/ERD'
import * as util from '@/js/editor/util'
import $ from 'jquery'

JSLog('store loaded', 'table')
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    table: null,
    rows: []
  },
  mutations: {
    // 그리드 활성화
    active (state, data) {
      JSLog('mutations', 'table grid', 'active')
      state.rows = []
      state.table = util.getData(ERD.store().state.tables, data.id)
      if (state.table) {
        $('.tui-grid-head-area:eq(1)').find('tr:eq(0) > th').text(state.table.name)
        state.table.columns.forEach(column => {
          state.rows.push({
            name: column.name,
            dataType: column.dataType,
            primaryKey: column.options.primaryKey,
            notNull: column.options.notNull,
            unique: column.options.unique,
            autoIncrement: column.options.autoIncrement,
            default: column.default,
            comment: column.comment
          })
        })
      }
    },
    // 삭제
    delete (state) {
      JSLog('mutations', 'table grid', 'delete')
      state.rows = []
      state.table = null
      $('.tui-grid-head-area:eq(1)').find('tr:eq(0) > th').text('')
    },
    // 컬럼데이터 동기화
    sync (state, data) {
      JSLog('mutations', 'table grid', 'sync')
      if (state.table) {
        if (data.isPK) {
          state.table.columns.forEach((column, i) => {
            if (i === data.rowKey) {
              column.ui.selected = true
              ERD.store().commit({
                type: 'columnKey',
                key: 'pk'
              })
            } else {
              column.ui.selected = false
            }
          })
        } else {
          state.table.columns.forEach((column, i) => {
            if (i === data.rowKey) {
              column.ui.selected = true
            } else {
              column.ui.selected = false
            }
          })
          util.setData(state.table.columns[data.rowKey], data.column)
        }
      }
    }
  }
})
