import JSLog from '@/js/JSLog'
import * as util from '@/js/editor/util'
import storeTable from './table'
import ERD from '@/js/editor/ERD'

JSLog('store loaded', 'mutationsColumn')

export default {
  // 컬럼 추가
  add (state, data) {
    JSLog('mutations', 'column', 'add')
    const undo = JSON.stringify(state)

    ERD.core.event.isEdit = true

    for (let table of state.tables) {
      if (data.id === table.id) {
        table.ui.height += state.COLUMN_HEIGHT
        const column = {
          id: util.guid(),
          name: '',
          comment: '',
          dataType: '',
          domainId: '',
          default: '',
          options: {
            autoIncrement: false,
            primaryKey: false,
            unique: false,
            notNull: false
          },
          ui: {
            selected: false,
            pk: false,
            fk: false,
            pfk: false,
            isDataTypeHint: false,
            isHover: false
          }
        }
        if (data.isInit) {
          util.setData(column, data.column)
        }
        table.columns.push(column)
        break
      }
    }

    if (!data.isInit) {
      // undo, redo 등록
      ERD.core.undoRedo.add({
        undo: undo,
        redo: JSON.stringify(state)
      })
    }
  },
  // 컬럼 삭제
  delete (state, data) {
    JSLog('mutations', 'column', 'delete')
    const undo = JSON.stringify(state)

    const table = util.getData(state.tables, data.tableId)
    for (let i in table.columns) {
      if (data.columnId === table.columns[i].id) {
        table.columns.splice(i, 1)
        table.ui.height -= state.COLUMN_HEIGHT
        break
      }
    }

    // 관계처리
    for (let i = 0; i < state.lines.length; i++) {
      if (state.lines[i].points[0].id === data.tableId || state.lines[i].points[1].id === data.tableId) {
        let endColumnId = null
        for (let j in state.lines[i].points[0].columnIds) {
          if (data.columnId === state.lines[i].points[0].columnIds[j] || data.columnId === state.lines[i].points[1].columnIds[j]) {
            endColumnId = state.lines[i].points[1].columnIds[j]
            state.lines[i].points[0].columnIds.splice(j, 1)
            state.lines[i].points[1].columnIds.splice(j, 1)
            util.changeIdentification(state, util.getData(state.tables, state.lines[i].points[1].id))
            break
          }
        }
        // fk시 해제처리
        if (state.lines[i].points[0].id === data.tableId) {
          const endTable = util.getData(state.tables, state.lines[i].points[1].id)
          for (let column of endTable.columns) {
            if (column.id === endColumnId) {
              if (column.ui.pfk) {
                column.ui.pk = true
                column.ui.pfk = false
              } else if (column.ui.fk) {
                column.ui.fk = false
              }
              break
            }
          }
        }
        // 관계 컬럼이 0개시 삭제
        if (state.lines[i].points[0].columnIds.length === 0 || state.lines[i].points[1].columnIds.length === 0) {
          this.commit({
            type: 'lineDelete',
            id: state.lines[i].id
          })
          i--
        }
      }
    }

    // 테이블 상세 활성화
    storeTable.commit({
      type: 'active',
      id: data.tableId
    })

    // 마지막 컬럼 포커스
    const isColumns = table.columns.length
    if (isColumns !== 0) {
      document.getElementById(`columnName_${table.columns[isColumns - 1].id}`).focus()
    }
    // undo, redo 등록
    ERD.core.undoRedo.add({
      undo: undo,
      redo: JSON.stringify(state)
    })
  },
  // 컬럼 NULL 조건 변경
  changeNull (state, data) {
    JSLog('mutations', 'column', 'changeNull')
    const undo = JSON.stringify(state)

    const table = util.getData(state.tables, data.tableId)
    const column = util.getData(table.columns, data.columnId)
    column.options.notNull = !column.options.notNull

    // undo, redo 등록
    ERD.core.undoRedo.add({
      undo: undo,
      redo: JSON.stringify(state)
    })
  },
  // 컬럼 선택
  selected (state, data) {
    JSLog('mutations', 'column', 'selected')
    this.commit({
      type: 'tableSelectedAllNone',
      isTable: false,
      isColumn: true
    })
    const table = util.getData(state.tables, data.tableId)
    if (table) {
      const column = util.getData(table.columns, data.columnId)
      if (column) column.ui.selected = true
    }

    // 테이블 상세 활성화
    storeTable.commit({
      type: 'active',
      id: data.tableId
    })
  },
  // 컬럼 key active
  key (state, data) {
    JSLog('mutations', 'column', 'key')
    const undo = JSON.stringify(state)

    for (let table of state.tables) {
      let check = false
      for (let column of table.columns) {
        if (column.ui.selected) {
          if (data.key === 'pk') {
            column.options.primaryKey = !column.options.primaryKey
            if (column.options.primaryKey) {
              column.options.notNull = true
            }
          }
          if (column.ui.fk) {
            column.ui.fk = false
            column.ui.pfk = true
            util.changeIdentification(state, table)
          } else if (column.ui.pfk) {
            column.ui.fk = true
            column.ui.pfk = false
            util.changeIdentification(state, table)
          } else {
            column.ui[data.key] = !column.ui[data.key]
          }
          check = true

          // 테이블 상세 활성화
          storeTable.commit({
            type: 'active',
            id: table.id
          })
        }
      }
      if (check) {
        break
      }
    }

    // undo, redo 등록
    ERD.core.undoRedo.add({
      undo: undo,
      redo: JSON.stringify(state)
    })
  },
  // 컬럼 데이터변경
  changeDataType (state, data) {
    JSLog('mutations', 'column', 'changeDataType')
    const undo = JSON.stringify(state)

    const table = util.getData(state.tables, data.tableId)
    const column = util.getData(table.columns, data.columnId)
    column.dataType = data.dataType

    // 테이블 상세 활성화
    storeTable.commit({
      type: 'active',
      id: data.tableId
    })

    // undo, redo 등록
    ERD.core.undoRedo.add({
      undo: undo,
      redo: JSON.stringify(state)
    })
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
  // 컬럼 데이터타입 관계 동기화
  relationSync (state, data) {
    JSLog('mutations', 'column', 'relationSync')
    const table = util.getData(state.tables, data.tableId)
    const column = util.getData(table.columns, data.columnId)
    if (util.isRelationSync(state, data.tableId, column)) {
      // 동기화 컬럼 탐색
      const columns = []
      const lines = state.lines.slice()
      util.getColumnsSync(columns, lines, state, data.tableId, column)
      // 컬럼 데이터 동기화
      columns.forEach(v => {
        v.dataType = column.dataType
      })
    }
  }
}
