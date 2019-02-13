import JSLog from '@/js/JSLog'
import Vue from 'vue'
import Vuex from 'vuex'
import ERD from '@/js/editor/ERD'
import * as util from '@/js/editor/util'

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
      state.rows = []
      state.table = util.getData(ERD.store().state.tables, data.id)
      state.table.columns.forEach(column => {
        state.rows.push({
          name: column.name,
          dataType: column.dataType,
          primaryKey: column.options.primaryKey,
          notNull: column.options.notNull,
          unique: column.options.unique,
          unsigned: column.options.unsigned,
          autoIncrement: column.options.autoIncrement,
          default: column.default,
          comment: column.comment
        })
      })
    },
    // 삭제
    remove (state) {
      state.rows = []
      state.table = null
    },
    // 컬럼데이터 동기화
    sync (state, data) {
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
          util.initData(state.table.columns[data.rowKey], data.column)
        }
      }
    }
  }
})
