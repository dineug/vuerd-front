import JSLog from '@/js/JSLog'
import * as util from '@/js/editor/util'
import storeERD from './erd'
import ERD from '@/js/editor/ERD'

JSLog('store loaded', 'mutationsTable')

export default {
  // 테이블 추가
  add (state) {
    JSLog('mutations', 'table', 'add')
    state.tables.push({
      id: util.guid(),
      name: '',
      comment: '',
      columns: [],
      ui: {
        selected: false,
        top: document.documentElement.scrollTop + 100,
        left: document.documentElement.scrollLeft + 200,
        width: storeERD.state.TABLE_WIDTH,
        height: storeERD.state.TABLE_HEIGHT
      }
    })
  },
  // 테이블 삭제
  delete (state, data) {
    JSLog('mutations', 'table', 'delete')
    for (let i in state.tables) {
      if (data.id === state.tables[i].id) {
        state.tables.splice(i, 1)
        break
      }
    }
    // 관계처리
    for (let i = 0; i < state.lines.length; i++) {
      let isLine = false
      for (let j in state.lines[i].points) {
        if (data.id === state.lines[i].points[j].id) {
          isLine = true
          break
        }
      }
      if (isLine) {
        if (data.id === state.lines[i].points[0].id) {
          const endTable = util.getData(state.tables, state.lines[i].points[1].id)
          for (let column of endTable.columns) {
            for (let columnId of state.lines[i].points[1].columnIds) {
              if (columnId === column.id) {
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
        }
        this.commit({
          type: 'lineDelete',
          id: state.lines[i].id
        })
        i--
      }
    }
  },
  // 테이블 높이 리셋
  heightReset (state) {
    JSLog('mutations', 'table', 'heightReset')
    for (let table of state.tables) {
      table.ui.height = table.columns.length * storeERD.state.COLUMN_HEIGHT + storeERD.state.TABLE_HEIGHT
    }
  },
  // 테이블 선택
  selected (state, data) {
    JSLog('mutations', 'table', 'selected')
    state.tables.forEach(v => {
      v.ui.selected = data.id === v.id
    })
    // column 선택 제거
    if (data.onlyTableSelected) {
      util.columnSelectedNone(state)
    }
    // 관계 drawing 시작
    if (ERD.core.event.isCursor && !ERD.core.event.isDraw) {
      const table = util.getData(state.tables, data.id)
      // table pk 컬럼이 있는지 체크 없으면 자동생성
      if (!util.tableIsPrimaryKey(table.columns)) {
        this.commit({
          type: 'columnAdd',
          id: table.id,
          isInit: true,
          column: {
            name: util.autoName(table.columns, 'column_name'),
            options: {
              primaryKey: true,
              notNull: true
            },
            ui: {
              pk: true
            }
          }
        })
      }
      const id = util.guid()
      state.lines.push({
        id: id,
        type: ERD.core.event.type,
        isIdentification: false,
        points: [
          {
            id: data.id,
            x: table.ui.left,
            y: table.ui.top,
            columnIds: []
          },
          {
            id: null,
            x: table.ui.left,
            y: table.ui.top,
            columnIds: []
          }
        ]
      })
      ERD.core.event.startCursor(id)

      // 관계 drawing 종료
    } else if (ERD.core.event.isDraw) {
      ERD.core.event.endCursor(data.id)
    }
  },
  // 테이블 top, left 변경
  tracker (state, data) {
    JSLog('mutations', 'table', 'tracker')
    const table = util.getData(state.tables, data.id)
    table.ui.top = data.top
    table.ui.left = data.left
    // 관계 업데이트
    state.lines.forEach(line => {
      line.points.forEach(v => {
        if (v.id === data.id) {
          v.x = data.left
          v.y = data.top
        }
      })
    })
  }
}
