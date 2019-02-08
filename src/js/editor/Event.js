import JSLog from '../JSLog'
import $ from 'jquery'
import * as util from './util'
import storeERD from '@/store/editor/erd'

/**
 * 이벤트 클래스
 */
class Event {
  constructor () {
    JSLog('module loaded', 'Event')

    this.core = null
    this.rightClickListener = []
    this.isCursor = false
    this.isDraw = false
    this.lineId = null
    this.cursor = null
    this.components = {
      TableMenu: null
    }

    this.setEvent()
  }

  // 종속성 초기화
  init (core) {
    JSLog('module dependency init', 'Event')
    this.core = core
  }

  setEvent () {
    // 페이지 이동시 경고창
    // window.onbeforeunload = e => {
    //   const dialogText = 'Dialog text here';
    //   e.returnValue = dialogText;
    //   return dialogText;
    // }
    // 전역 이벤트
    $(document).on('contextmenu', function (e) {
      // 오른쪽 클릭 이벤트
      JSLog('event', 'contextmenu')
      e.preventDefault()
      this.core.event.onRightClick(e)
    }.bind(this)).on('mousemove', function (e) {
      // 마우스 이동 이벤트
      if (this.isDraw) {
        storeERD.commit({
          type: 'lineDraw',
          id: this.lineId,
          x: e.clientX + document.documentElement.scrollLeft,
          y: e.clientY + document.documentElement.scrollTop
        })
      }
    }.bind(this)).on('mousedown', function (e) {
      // 마우스 다운 이벤트
      JSLog('event', 'mousedown')
      // 테이블 메뉴 hide
      if (!$(e.target).closest('#menu_table').length) {
        this.components.TableMenu.isShow = false
      }
      // 데이터 타입 힌트 hide
      if (!$(e.target).closest('.erd_data_type_list').length) {
        storeERD.commit({
          type: 'dataTypeHintVisibleAll',
          isDataTypeHint: false
        })
      }
    }.bind(this)).on('mouseup', function (e) {
      // 마우스 업 이벤트
      JSLog('event', 'mouseup')

    }.bind(this))
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
        $('body').css('cursor', `url("/img/erd/${cursor}.png") 16 16, auto`)
        this.isCursor = true
        this.cursor = cursor
        break
      case 'stop':
        $('body').removeAttr('style')
        this.isCursor = false
        this.cursor = null
        if (this.isDraw) {
          this.onDraw('stop')
        }
        break
    }
  }

  // 관계 draw
  onDraw (type, id) {
    switch (type) {
      case 'start':
        this.lineId = id
        this.isDraw = true
        break
      case 'stop':
        this.isDraw = false
        if (id) {
          const table = util.getData(storeERD.state.tables, id)

          // fk 컬럼 생성
          const startColumnIds = []
          const endColumnIds = []
          const line = util.getData(storeERD.state.lines, this.lineId)
          const columns = util.getPKColumns(line.points[0].id)
          columns.forEach(v => {
            const columnId = util.guid()
            startColumnIds.push(v.id)
            endColumnIds.push(columnId)
            storeERD.commit({
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
          storeERD.commit({
            type: 'lineDraw',
            id: this.lineId,
            x: table.ui.left,
            y: table.ui.top,
            tableId: id,
            startColumnIds: startColumnIds,
            endColumnIds: endColumnIds
          })

          this.onCursor('stop')
        } else {
          storeERD.commit({
            type: 'lineDelete',
            id: this.lineId
          })
        }
        this.lineId = null
        break
    }
  }
}

export default new Event()
