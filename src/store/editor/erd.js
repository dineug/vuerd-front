import Vue from 'vue'
import Vuex from 'vuex'
import { guid, getData, getDataTypeSearch } from '@/js/editor/common'
import dataType from './dataType'
import ERD from '@/js/editor/ERD'

Vue.use(Vuex)

const TABLE_WIDTH = 710
const TABLE_HEIGHT = 88
const COLUMN_HEIGHT = 25

// ERD 데이터
export default new Vuex.Store({
  state: {
    DBType: 'MySQL',
    tables: [],
    lines: []
  },
  mutations: {
    // 테이블 추가
    addTable (state) {
      state.tables.push({
        id: guid(),
        name: null,
        comment: null,
        columns: [],
        ui: {
          selected: false,
          top: document.documentElement.scrollTop + 100,
          left: document.documentElement.scrollLeft + 200,
          width: TABLE_WIDTH,
          height: TABLE_HEIGHT
        }
      })
    },
    // 테이블 삭제
    deleteTable (state, data) {
      for (let i in state.tables) {
        if (data.id === state.tables[i].id) {
          state.tables.splice(i, 1)
          break
        }
      }
      // line 삭제
      for (let i = 0; i < state.lines.length; i++) {
        let check = false
        for (let j in state.lines[i].points) {
          if (data.id === state.lines[i].points[j].id) {
            check = true
            break
          }
        }
        if (check) {
          this.commit({
            type: 'deleteLine',
            id: state.lines[i].id
          })
          i--
        }
      }
    },
    // 컬럼 추가
    addColumn (state, data) {
      for (let table of state.tables) {
        if (data.id === table.id) {
          table.ui.height += COLUMN_HEIGHT
          table.columns.push({
            id: guid(),
            name: null,
            comment: null,
            dataType: null,
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
              dataTypes: dataType.MySQL
            }
          })
          break
        }
      }
    },
    // 컬럼 삭제
    deleteColumn (state, data) {
      const table = getData(state.tables, data.tableId)
      for (let i in table.columns) {
        if (data.columnId === table.columns[i].id) {
          table.columns.splice(i, 1)
          table.ui.height -= COLUMN_HEIGHT
          break
        }
      }
    },
    // NULL 조건 변경
    changeNull (state, data) {
      const table = getData(state.tables, data.tableId)
      const column = getData(table.columns, data.columnId)
      column.options.notNull = !column.options.notNull
    },
    // DB 변경
    changeDB (state, data) {
      state.DBType = data.DBType
      for (let table of state.tables) {
        for (let column of table.columns) {
          column.ui.dataTypes = dataType[data.DBType]
        }
      }
    },
    // 테이블 높이 리셋
    tableHeightReset (state) {
      for (let table of state.tables) {
        table.ui.height = table.columns.length * COLUMN_HEIGHT + TABLE_HEIGHT
      }
    },
    // table 선택
    tableSelected (state, data) {
      state.tables.forEach(v => {
        v.ui.selected = data.id === v.id
      })
      // column 선택 제거
      if (data.onlyTableSelected) {
        columnSelectedNone(state)
      }
      // line drawing 시작
      if (ERD.core.event.isCursor && !ERD.core.event.isDraw) {
        const table = getData(state.tables, data.id)
        // table pk 컬럼이 있는지 체크 없으면 자동생성
        const id = guid()
        state.lines.push({
          id: id,
          type: ERD.core.event.type,
          isIdentification: false,
          points: [
            {
              id: data.id,
              x: table.ui.left,
              y: table.ui.top
            },
            {
              id: null,
              x: table.ui.left,
              y: table.ui.top
            }
          ]
        })
        ERD.core.event.startCursor(id)

        // line drawing 종료
      } else if (ERD.core.event.isDraw) {
        ERD.core.event.endCursor(data.id)
      }
    },
    // column 선택
    columnSelected (state, data) {
      columnSelectedNone(state)
      const table = getData(state.tables, data.tableId)
      const column = getData(table.columns, data.columnId)
      if (column) column.ui.selected = true
    },
    // column key active
    columnKey (state, data) {
      switch (data.key) {
        case 'pk':
          setColumnKey(state, data.key)
          break
      }
    },
    // 데이터변경
    changeColumnDataType (state, data) {
      const table = getData(state.tables, data.tableId)
      const column = getData(table.columns, data.columnId)
      column.dataType = data.dataType
    },
    // 데이터타입 힌트 show/hide
    dataTypeHintVisible (state, data) {
      const table = getData(state.tables, data.tableId)
      const column = getData(table.columns, data.columnId)
      column.ui.isDataTypeHint = data.isDataTypeHint
    },
    // 데이터타입 힌트 show/hide ALL
    dataTypeHintVisibleAll (state, data) {
      for (let table of state.tables) {
        for (let column of table.columns) {
          column.ui.isDataTypeHint = data.isDataTypeHint
        }
      }
    },
    // 데이터타입 검색
    changeDataTypeHint (state, data) {
      const table = getData(state.tables, data.tableId)
      const column = getData(table.columns, data.columnId)
      column.ui.dataTypes = getDataTypeSearch(data.key)
    },
    // table top, left 변경
    tableTracker (state, data) {
      const table = getData(state.tables, data.id)
      table.ui.top = data.top
      table.ui.left = data.left
      // line 업데이트
      state.lines.forEach(line => {
        line.points.forEach(v => {
          if (v.id === data.id) {
            v.x = data.left
            v.y = data.top
          }
        })
      })
    },
    // line drawing
    lineDraw (state, data) {
      const line = getData(state.lines, data.id)
      line.points[1].x = data.x
      line.points[1].y = data.y
      if (data.tableId) line.points[1].id = data.tableId
    },
    // line 삭제
    deleteLine (state, data) {
      for (let i in state.lines) {
        if (data.id === state.lines[i].id) {
          state.lines.splice(i, 1)
          break
        }
      }
    }
  }
})

// column 선택 초기화
function columnSelectedNone (state) {
  state.tables.forEach(table => {
    table.columns.forEach(v => {
      v.ui.selected = false
    })
  })
}

// column key active
function setColumnKey (state, key) {
  for (let table of state.tables) {
    let check = false
    for (let column of table.columns) {
      if (column.ui.selected) {
        column.ui.key[key] = !column.ui.key[key]
        if (key === 'pk' || key === 'pfk') column.options.primaryKey = column.ui.key[key]
        check = true
        break
      }
    }
    if (check) {
      break
    }
  }
}
