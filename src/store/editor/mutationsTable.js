import JSLog from '@/js/JSLog'
import * as util from '@/js/editor/util'
import ERD from '@/js/editor/ERD'

JSLog('store loaded', 'mutationsTable')

export default {
  // 테이블 추가
  add (state) {
    JSLog('mutations', 'table', 'add')
    const newTable = {
      id: util.guid(),
      name: '',
      comment: '',
      columns: [],
      ui: {
        selected: false,
        top: document.documentElement.scrollTop + 100,
        left: document.documentElement.scrollLeft + 200,
        width: state.TABLE_WIDTH,
        height: state.TABLE_HEIGHT,
        zIndex: util.getZIndex()
      }
    }
    let isPosition = true
    while (isPosition) {
      isPosition = false
      for (let table of state.tables) {
        if (table.ui.top === newTable.ui.top && table.ui.left === newTable.ui.left) {
          isPosition = true
          newTable.ui.top += 50
          newTable.ui.left += 50
          break
        }
      }
    }
    state.tables.push(newTable)
    this.commit({
      type: 'tableSelected',
      id: newTable.id,
      onlyTableSelected: false,
      isTableAdd: true
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
        // fk시 해제처리
        if (data.id === state.lines[i].points[0].id) {
          const endTable = util.getData(state.tables, state.lines[i].points[1].id)
          if (endTable) {
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
        }
        // 관계 컬럼이 0개시 삭제
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
      table.ui.height = table.columns.length * state.COLUMN_HEIGHT + state.TABLE_HEIGHT
    }
  },
  // 테이블 선택
  selected (state, data) {
    JSLog('mutations', 'table', 'selected')
    const table = util.getData(state.tables, data.id)
    // z-index 처리
    const zIndex = util.getZIndex()
    if (table.ui.zIndex !== zIndex - 1) {
      table.ui.zIndex = zIndex
    }
    // multi select
    if (data.ctrlKey) {
      table.ui.selected = true
    } else {
      state.tables.forEach(v => {
        v.ui.selected = data.id === v.id
      })
    }
    // column 선택 제거
    if (data.onlyTableSelected) {
      this.commit({
        type: 'tableSelectedAllNone',
        isTable: false,
        isColumn: true
      })
      const tableIds = []
      for (let targetTable of state.tables) {
        if (targetTable.ui.selected) {
          tableIds.push(targetTable.id)
        }
      }
      ERD.core.event.onDraggable('start', tableIds)
    }
    // 테이블추가에서 호출시 처리
    if (data.isTableAdd) {
      this.commit({
        type: 'tableSelectedAllNone',
        isTable: false,
        isColumn: true
      })
    } else {
      // 관계 drawing 시작
      if (ERD.core.event.isCursor && !ERD.core.event.isDraw) {
        // table pk 컬럼이 있는지 체크 없으면 자동생성
        if (!util.tableIsPrimaryKey(table.columns)) {
          this.commit({
            type: 'columnAdd',
            id: table.id,
            isInit: true,
            column: {
              name: util.autoName(table.columns, 'unnamed'),
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
        this.commit({
          type: 'lineAdd',
          tableId: data.id,
          x: table.ui.left,
          y: table.ui.top
        })
        // 관계 drawing 종료
      } else if (ERD.core.event.isDraw) {
        ERD.core.event.onDraw('stop', data.id)
      }
    }
  },
  // 테이블 top, left 변경
  draggable (state, data) {
    JSLog('mutations', 'table', 'draggable')
    const table = util.getData(state.tables, data.id)
    table.ui.top += data.y
    table.ui.left += data.x
    // 관계 업데이트
    state.lines.forEach(line => {
      line.points.forEach(v => {
        if (v.id === data.id) {
          v.x = table.ui.left
          v.y = table.ui.top
        }
      })
    })
  },
  // 테이블 및 컬럼 selected All 해제
  selectedAllNone (state, data) {
    state.tables.forEach(table => {
      if (data.isTable) table.ui.selected = false
      table.columns.forEach(column => {
        if (data.isColumn) column.ui.selected = false
      })
    })
  },
  // 테이블 드래그 selected
  multiSelected (state, data) {
    state.tables.forEach(table => {
      const point = util.getPoint(table.ui)
      if (data.min.x <= point.top.x &&
        data.min.y <= point.left.y &&
        data.max.x >= point.top.x &&
        data.max.y >= point.left.y) {
        table.ui.selected = true
      } else {
        table.ui.selected = false
      }
    })
  },
  // 테이블 전체 선택
  selectedAll (state) {
    state.tables.forEach(table => {
      table.ui.selected = true
    })
  }
}
