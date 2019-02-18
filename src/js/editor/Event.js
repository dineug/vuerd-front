import JSLog from '../JSLog'
import $ from 'jquery'
import * as util from './util'
import model from '@/store/editor/model'

const CANVAS_SIZE = 5000
const PREVIEW_SIZE = 150

/**
 * 이벤트 클래스
 */
class Event {
  constructor () {
    JSLog('module loaded', 'Event')

    this.core = null
    this.rightClickListener = []
    this.components = {
      QuickMenu: null,
      CanvasMain: [],
      CanvasMenu: null,
      CanvasGrid: null
    }
    this.isEdit = false

    // relation Draw
    this.isCursor = false
    this.isDraw = false
    this.lineId = null
    this.cursor = null

    // table Draggable
    this.isDraggable = false
    this.tableIds = []
    this.move = {
      x: 0,
      y: 0
    }

    // mouse Drag
    this.isSelectedColumn = false
    this.isDrag = false
    this.drag = {
      x: 0,
      y: 0
    }

    // preview
    this.isPreview = false
    this.preview = {
      left: (-1 * CANVAS_SIZE / 2) + (PREVIEW_SIZE / 2) - PREVIEW_SIZE - 20,
      x: 150 + 20,
      ratio: CANVAS_SIZE / PREVIEW_SIZE
    }

    // move
    this.isMove = false
  }

  // 종속성 초기화
  init (core) {
    JSLog('module dependency init', 'Event')
    this.core = core
    this.setEvent()
  }

  setEvent () {
    // 페이지 이동시 경고창
    // window.onbeforeunload = e => {
    //   const dialogText = 'Dialog text here';
    //   e.returnValue = dialogText;
    //   return dialogText;
    // }

    // 전역 이벤트
    this.on('contextmenu', e => {
      // 오른쪽 클릭 이벤트
      JSLog('event', 'contextmenu')
      e.preventDefault()
      this.core.event.onRightClick(e)
    }).on('resize', e => {
      // 미리보기 창크기 동적 위치
      const width = window.innerWidth
      const height = window.innerHeight
      this.components.CanvasMenu.preview.left = this.preview.left + width
      this.components.CanvasMenu.preview.x = width - this.preview.x
      this.components.CanvasMenu.preview.target.width = width * 0.03
      this.components.CanvasMenu.preview.target.height = height * 0.03
    }).on('scroll', e => {
      // 스크롤 위치에 따라 미리보기 target 수정
      this.components.CanvasMenu.preview.target.x = window.scrollX / this.preview.ratio
      this.components.CanvasMenu.preview.target.y = window.scrollY / this.preview.ratio
    }).on('mousedown', e => {
      JSLog('event', 'mousedown')
      // 테이블 메뉴 hide
      if (!$(e.target).closest('.quick_menu').length) {
        this.components.QuickMenu.isShow = false
      }
      // 데이터 타입 힌트 hide
      if (!$(e.target).closest('.erd_data_type_list').length &&
        !$(e.target).closest('.menu_sidebar').length) {
        this.core.erd.store().commit({
          type: 'columnDataTypeHintVisibleAll',
          isDataTypeHint: false
        })
      }
      // 테이블 및 컬럼 selected 해제
      if (!$(e.target).closest('.erd_table').length &&
        !$(e.target).closest('.quick_menu_pk').length &&
        !$(e.target).closest('.table_detail').length &&
        !$(e.target).closest('.menu_bottom').length) {
        this.core.erd.store().commit({
          type: 'tableSelectedAllNone',
          isTable: true,
          isColumn: true
        })
        this.isSelectedColumn = false
      }

      if (!e.altKey &&
        !this.isDraggable &&
        !this.isSelectedColumn &&
        !this.isPreview &&
        !$(e.target).closest('.menu_top').length &&
        !$(e.target).closest('.menu_sidebar').length &&
        !$(e.target).closest('.menu_bottom').length &&
        !$(e.target).closest('.table_detail').length) {
        if (e.ctrlKey) {
          // 마우스 drag
          this.onDrag('start', e)
        } else {
          // 마우스 이동
          this.onMove('start')
        }
      }
    }).on('mouseup', e => {
      JSLog('event', 'mouseup')
      this.onDraggable('stop')
      this.onDrag('stop', e)
      this.onPreview('stop')
      this.onMove('stop')
    }).on('mousemove', e => {
      if (this.move.x === 0 && this.move.y === 0) {
        this.move.x = e.clientX + document.documentElement.scrollLeft
        this.move.y = e.clientY + document.documentElement.scrollTop
      }

      // 관계 draw
      this.onDraw('update', null, e)
      // 테이블 draggable
      this.onDraggable('update', null, e)
      // 미리보기 이동
      this.onPreview('update', e)
      // 마우스 drag
      if (!this.isDraggable && !this.isSelectedColumn) {
        this.onDrag('update', e)
      }
      // 마우스 이동
      this.onMove('update', e)

      this.move.x = e.clientX + document.documentElement.scrollLeft
      this.move.y = e.clientY + document.documentElement.scrollTop
    }).on('keydown', e => {
      JSLog('event', 'keydown', e.keyCode)
      switch (e.keyCode) {
        case 13: // key: Enter
          if (e.altKey) {
            e.preventDefault()
            // 컬럼 생성
            for (let table of this.core.erd.store().state.tables) {
              if (table.ui.selected) {
                this.core.erd.store().commit({
                  type: 'columnAdd',
                  id: table.id
                })
              }
            }
          }
          break
        case 90: // key: Z
          if (e.ctrlKey && e.shiftKey) {
            e.preventDefault()
            this.core.undoRedo.getManager().redo()
          } else if (e.ctrlKey) {
            e.preventDefault()
            this.core.undoRedo.getManager().undo()
          }
          break
        case 75: // key: K
          if (e.altKey) {
            e.preventDefault()
            // 컬럼 PK 부여
            this.core.erd.store().commit({
              type: 'columnKey',
              key: 'pk'
            })
          }
          break
        case 78: // key: N
          if (e.altKey) {
            e.preventDefault()
            // 모델 생성
            model.commit({ type: 'modelAdd' })
          }
          break
        case 84: // key: T
          if (e.altKey) {
            e.preventDefault()
            // 테이블 생성
            this.core.erd.store().commit({ type: 'tableAdd' })
          }
          break
        case 65: // key: A
          if (e.ctrlKey) {
            e.preventDefault()
            // 테이블 전체 선택
            this.core.erd.store().commit({ type: 'tableSelectedAll' })
          }
          break
        case 27: // key: ESC
          // 모든 이벤트 중지
          this.stop()
          break
        case 46: // key: Delete
          e.preventDefault()
          if (e.ctrlKey) {
            // 모델 삭제
            for (let tab of model.state.tabs) {
              if (tab.active) {
                model.commit({
                  type: 'modelDelete',
                  id: tab.id
                })
                break
              }
            }
          } else if (e.altKey) {
            // 테이블 삭제
            const store = this.core.erd.store()
            for (let i = 0; i < store.state.tables.length; i++) {
              if (store.state.tables[i].ui.selected) {
                store.commit({
                  type: 'tableDelete',
                  id: store.state.tables[i].id
                })
                i--
              }
            }
          } else {
            // 컬럼 삭제
            const store = this.core.erd.store()
            store.state.tables.forEach(table => {
              for (let i = 0; i < table.columns.length; i++) {
                if (table.columns[i].ui.selected) {
                  store.commit({
                    type: 'columnDelete',
                    tableId: table.id,
                    columnId: table.columns[i].id
                  })
                  break
                }
              }
            })
          }
          break
        case 49: // key: 1
          if (e.ctrlKey) {
            e.preventDefault()
            model.commit({
              type: 'modelActiveKeyMap',
              index: 1
            })
          } else if (e.altKey) {
            e.preventDefault()
            // 관계 1:1
            if (this.isCursor) {
              this.onCursor('stop')
            } else {
              this.onCursor('start', 'erd-0-1')
            }
          }
          break
        case 50: // key: 2
          if (e.ctrlKey) {
            e.preventDefault()
            model.commit({
              type: 'modelActiveKeyMap',
              index: 2
            })
          } else if (e.altKey) {
            e.preventDefault()
            // 관계 1:N
            if (this.isCursor) {
              this.onCursor('stop')
            } else {
              this.onCursor('start', 'erd-0-1-N')
            }
          }
          break
        case 51: // key: 3
          if (e.ctrlKey) {
            e.preventDefault()
            model.commit({
              type: 'modelActiveKeyMap',
              index: 3
            })
          }
          break
        case 52: // key: 4
          if (e.ctrlKey) {
            e.preventDefault()
            model.commit({
              type: 'modelActiveKeyMap',
              index: 4
            })
          }
          break
        case 53: // key: 5
          if (e.ctrlKey) {
            e.preventDefault()
            model.commit({
              type: 'modelActiveKeyMap',
              index: 5
            })
          }
          break
        case 54: // key: 6
          if (e.ctrlKey) {
            e.preventDefault()
            model.commit({
              type: 'modelActiveKeyMap',
              index: 6
            })
          }
          break
        case 55: // key: 7
          if (e.ctrlKey) {
            e.preventDefault()
            model.commit({
              type: 'modelActiveKeyMap',
              index: 7
            })
          }
          break
        case 56: // key: 8
          if (e.ctrlKey) {
            e.preventDefault()
            model.commit({
              type: 'modelActiveKeyMap',
              index: 8
            })
          }
          break
        case 57: // key: 9
          if (e.ctrlKey) {
            e.preventDefault()
            model.commit({
              type: 'modelActiveKeyMap',
              index: 9
            })
          }
          break
      }
    }).on('keyup', e => {
      JSLog('event', 'keyup', e.keyCode)
    })
  }

  // 전역 이벤트 연결
  on (type, fn) {
    window.addEventListener(type, fn)
    return this
  }

  // 오른쪽 클릭 이벤트 추가
  addRightClick (fn, id) {
    this.rightClickListener.push({
      fn: fn,
      id: id
    })
  }

  // 오른쪽 클릭 이벤트 삭제
  removeRightClick (id) {
    for (let i in this.rightClickListener) {
      if (id === this.rightClickListener[i].id) {
        this.rightClickListener.splice(i, 1)
        break
      }
    }
  }

  // 오른쪽 클릭 이벤트 실행
  onRightClick (e) {
    this.rightClickListener.forEach(v => {
      if (typeof v.fn === 'function') v.fn(e)
    })
  }

  // 전역 커서 설정
  onCursor (type, cursor) {
    switch (type) {
      case 'start':
        document.body.setAttribute('style', `cursor: url("/img/erd/${cursor}.png") 16 16, auto;`)
        this.isCursor = true
        this.cursor = cursor
        break
      case 'stop':
        document.body.removeAttribute('style')
        this.isCursor = false
        this.cursor = null
        this.onDraw('stop')
        break
    }
  }

  // 관계 draw
  onDraw (type, id, e) {
    switch (type) {
      case 'start':
        this.lineId = id
        this.isDraw = true
        break
      case 'update':
        if (this.isDraw) {
          this.core.erd.store().commit({
            type: 'lineDraw',
            id: this.lineId,
            x: e.clientX + document.documentElement.scrollLeft,
            y: e.clientY + document.documentElement.scrollTop
          })
        }
        break
      case 'stop':
        if (this.isDraw) {
          this.isDraw = false
          if (id) {
            const table = util.getData(this.core.erd.store().state.tables, id)
            // fk 컬럼 생성
            const startColumnIds = []
            const endColumnIds = []
            const line = util.getData(this.core.erd.store().state.lines, this.lineId)
            const startTable = util.getData(this.core.erd.store().state.tables, line.points[0].id)
            const columns = util.getColumnOptions('primaryKey', startTable.columns)
            columns.forEach(v => {
              const columnId = util.guid()
              startColumnIds.push(v.id)
              endColumnIds.push(columnId)
              this.core.erd.store().commit({
                type: 'columnAdd',
                id: id,
                isInit: true,
                column: {
                  id: columnId,
                  name: util.autoName(table.columns, v.name),
                  comment: v.comment,
                  dataType: v.dataType,
                  options: {
                    notNull: true
                  },
                  ui: {
                    fk: true
                  }
                }
              })
            })

            // line drawing
            this.core.erd.store().commit({
              type: 'lineDraw',
              id: this.lineId,
              x: table.ui.left,
              y: table.ui.top,
              tableId: id,
              startColumnIds: startColumnIds,
              endColumnIds: endColumnIds
            })

            // undo, redo 등록
            this.core.undoRedo.add({
              undo: this.core.undoRedo.undoJson.draw,
              redo: JSON.stringify(this.core.erd.store().state)
            })
            this.onCursor('stop')
          } else {
            this.core.erd.store().commit({
              type: 'lineDelete',
              id: this.lineId
            })
          }
          this.lineId = null
        }
        break
    }
  }

  // 테이블 드래그 이벤트
  onDraggable (type, ids, e) {
    switch (type) {
      case 'start':
        this.isDraggable = true
        this.tableIds = ids
        break
      case 'update':
        if (this.isDraggable) {
          e.preventDefault()
          this.tableIds.forEach(tableId => {
            this.core.erd.store().commit({
              type: 'tableDraggable',
              id: tableId,
              x: e.clientX + document.documentElement.scrollLeft - this.move.x,
              y: e.clientY + document.documentElement.scrollTop - this.move.y
            })
          })
        }
        break
      case 'stop':
        if (this.isDraggable) {
          this.isDraggable = false
          this.tableIds = []
        }
        break
    }
  }

  // 마우스 드래그 이벤트
  onDrag (type, e) {
    switch (type) {
      case 'start':
        this.isDrag = true
        this.components.CanvasMain.forEach(v => {
          v.svg.top = 0
          v.svg.left = 0
          v.svg.width = 0
          v.svg.height = 0
          v.svg.isDarg = true
        })
        this.drag.x = e.clientX + document.documentElement.scrollLeft
        this.drag.y = e.clientY + document.documentElement.scrollTop
        break
      case 'update':
        if (this.isDrag) {
          e.preventDefault()
          const currentX = e.clientX + document.documentElement.scrollLeft
          const currentY = e.clientY + document.documentElement.scrollTop
          const min = {
            x: this.drag.x < currentX ? this.drag.x : currentX,
            y: this.drag.y < currentY ? this.drag.y : currentY
          }
          const max = {
            x: this.drag.x > currentX ? this.drag.x : currentX,
            y: this.drag.y > currentY ? this.drag.y : currentY
          }
          this.components.CanvasMain.forEach(v => {
            v.svg.top = min.y
            v.svg.left = min.x
            v.svg.width = max.x - min.x
            v.svg.height = max.y - min.y
          })
          this.core.erd.store().commit({
            type: 'tableMultiSelected',
            min: min,
            max: max
          })
        }
        break
      case 'stop':
        if (this.isDrag) {
          this.isDrag = false
          this.components.CanvasMain.forEach(v => {
            v.svg.isDarg = false
          })
        }
        break
    }
  }

  // 미리보기 네비게이션
  onPreview (type, e) {
    switch (type) {
      case 'start':
        this.isPreview = true
        break
      case 'update':
        if (this.isPreview) {
          const moveX = e.clientX + document.documentElement.scrollLeft - this.move.x
          const moveY = e.clientY + document.documentElement.scrollTop - this.move.y
          const x = this.components.CanvasMenu.preview.target.x + moveX
          const y = this.components.CanvasMenu.preview.target.y + moveY
          const width = window.innerWidth
          const height = window.innerHeight
          const targetWidth = width * 0.03
          const targetHeight = height * 0.03
          if (x >= 0 && targetWidth + x <= 150) {
            this.components.CanvasMenu.preview.target.x = x
            window.scrollTo(x * this.preview.ratio, window.scrollY)
          }
          if (y >= 0 && targetHeight + y <= 150) {
            this.components.CanvasMenu.preview.target.y = y
            window.scrollTo(window.scrollX, y * this.preview.ratio)
          }
        }
        break
      case 'stop':
        if (this.isPreview) {
          this.isPreview = false
        }
        break
    }
  }

  // 마우스 클릭 이동
  onMove (type, e) {
    switch (type) {
      case 'start':
        this.isMove = true
        break
      case 'update':
        if (this.isMove) {
          const x = e.clientX + document.documentElement.scrollLeft - this.move.x
          const y = e.clientY + document.documentElement.scrollTop - this.move.y
          window.scrollTo(-1 * x + window.scrollX, window.scrollY)
          window.scrollTo(window.scrollX, -1 * y + window.scrollY)
        }
        break
      case 'stop':
        if (this.isMove) {
          this.isMove = false
        }
        break
    }
  }

  // 모든 이벤트 중지
  stop () {
    this.onCursor('stop')
    this.onDraw('stop')
    this.onDraggable('stop')
    this.onDrag('stop')
    this.onMove('stop')
    this.components.QuickMenu.isShow = false
    this.components.CanvasGrid.isTable = false
    this.isSelectedColumn = false
    // 모든 selected 해제
    this.core.erd.store().commit({
      type: 'tableSelectedAllNone',
      isTable: true,
      isColumn: true
    })
    this.core.erd.store().commit({
      type: 'columnDataTypeHintVisibleAll',
      isDataTypeHint: false
    })
  }
}

export default new Event()
