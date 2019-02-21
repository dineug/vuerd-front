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
      JSLog('mutations', 'table grid', 'active')
      if (ERD.core.event.isGrid.table) {
        ERD.core.event.components.CanvasGrid.isTable = false
      }
      state.rows = []
      state.table = util.getData(ERD.store().state.tables, data.id)
      if (state.table) {
        state.table.columns.forEach(column => {
          state.rows.push({
            id: column.id,
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
      if (ERD.core.event.isGrid.table) {
        ERD.core.event.components.CanvasGrid.isTable = false
      }
      state.rows = []
      state.table = null
    },
    // 컬럼데이터 동기화
    sync (state, data) {
      JSLog('mutations', 'table grid', 'sync')
      if (state.table) {
        const undo = JSON.stringify(ERD.core.erd.store().state)
        if (data.isPK) {
          state.table.columns.forEach((column, i) => {
            if (i === data.rowKey) {
              column.ui.selected = true
            } else {
              column.ui.selected = false
            }
          })
          ERD.store().commit({
            type: 'columnKey',
            key: 'pk'
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
          if (data.column.dataType) {
            // 컬럼 데이터타입 관계 동기화
            ERD.store().commit({
              type: 'columnRelationSync',
              tableId: state.table.id,
              columnId: state.table.columns[data.rowKey].id
            })
          }
          // 도메인 동기화
          if (data.column.dataType || data.column.default) {
            ERD.store().commit({
              type: 'columnDomainSync',
              tableId: state.table.id,
              columnId: state.table.columns[data.rowKey].id
            })
          }
        }
        ERD.core.erd.store().commit({ type: 'columnWidthReset' })
        // undo, redo 등록
        ERD.core.undoRedo.add({
          undo: undo,
          redo: JSON.stringify(ERD.core.erd.store().state)
        })
      }
    }
  }
})
