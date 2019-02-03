import JSLog from '@/js/JSLog'
import * as util from '@/js/editor/util'
import storeERD from './erd'
import dataType from './dataType'

export default {
  // 컬럼 추가
  add (state, data) {
    JSLog('mutations', 'column', 'add')
    for (let table of state.tables) {
      if (data.id === table.id) {
        table.ui.height += storeERD.state.COLUMN_HEIGHT
        const column = {
          id: util.guid(),
          name: '',
          comment: '',
          dataType: '',
          options: {
            autoIncrement: false,
            primaryKey: false,
            unique: false,
            notNull: false,
            unsigned: false
          },
          ui: {
            selected: false,
            key: {
              pk: false,
              fk: false,
              pfk: false
            },
            isDataTypeHint: false,
            dataTypes: dataType[state.DBType]
          }
        }
        if (data.isInit) {
          util.initColumn(column, data.column)
        }
        table.columns.push(column)
        break
      }
    }
  },
  // 컬럼 삭제
  delete (state, data) {
    JSLog('mutations', 'column', 'delete')
    const table = util.getData(state.tables, data.tableId)
    for (let i in table.columns) {
      if (data.columnId === table.columns[i].id) {
        table.columns.splice(i, 1)
        table.ui.height -= storeERD.state.COLUMN_HEIGHT
        break
      }
    }
  },
  // 컬럼 NULL 조건 변경
  changeNull (state, data) {
    JSLog('mutations', 'column', 'changeNull')
    const table = util.getData(state.tables, data.tableId)
    const column = util.getData(table.columns, data.columnId)
    column.options.notNull = !column.options.notNull
  },
  // 컬럼 선택
  selected (state, data) {
    JSLog('mutations', 'column', 'selected')
    util.columnSelectedNone(state)
    const table = util.getData(state.tables, data.tableId)
    const column = util.getData(table.columns, data.columnId)
    if (column) column.ui.selected = true
  },
  // 컬럼 key active
  key (state, data) {
    JSLog('mutations', 'column', 'key')
    for (let table of state.tables) {
      let check = false
      for (let column of table.columns) {
        if (column.ui.selected) {
          if (column.ui.key.fk) {
            column.ui.key.fk = false
            column.ui.key.pfk = true
          } else if (column.ui.key.pfk) {
            column.ui.key.fk = true
            column.ui.key.pfk = false
          } else {
            column.ui.key[data.key] = !column.ui.key[data.key]
          }
          if (data.key === 'pk') column.options.primaryKey = !column.options.primaryKey
          check = true
          break
        }
      }
      if (check) {
        break
      }
    }
  },
  // 컬럼 데이터변경
  changeDataType (state, data) {
    JSLog('mutations', 'column', 'changeDataType')
    const table = util.getData(state.tables, data.tableId)
    const column = util.getData(table.columns, data.columnId)
    column.dataType = data.dataType
  },
  // 컬럼 데이터타입 힌트 show/hide
  dataTypeHintVisible (state, data) {
    JSLog('mutations', 'column', 'dataTypeHintVisible')
    const table = util.getData(state.tables, data.tableId)
    const column = util.getData(table.columns, data.columnId)
    column.ui.isDataTypeHint = data.isDataTypeHint
  },
  // 컬럼 데이터타입 힌트 show/hide ALL
  dataTypeHintVisibleAll (state, data) {
    JSLog('mutations', 'column', 'dataTypeHintVisibleAll')
    for (let table of state.tables) {
      for (let column of table.columns) {
        column.ui.isDataTypeHint = data.isDataTypeHint
      }
    }
  },
  // 컬럼 데이터타입 검색
  changeDataTypeHint (state, data) {
    JSLog('mutations', 'column', 'changeDataTypeHint')
    const table = util.getData(state.tables, data.tableId)
    const column = util.getData(table.columns, data.columnId)
    column.ui.dataTypes = util.getDataTypeSearch(data.key)
  }
}
