import JSLog from '../JSLog'
import $ from 'jquery'
import * as util from './util'
import storeERD from '@/store/editor/erd'

/**
 * 이벤트 클래스
 */
class Event {
  constructor () {
    JSLog('Class Event')

    this.core = null
    this.rightClickListener = []
    this.isCursor = false
    this.isDraw = false
    this.eventTarget = null
    this.lineId = null
    this.type = null

    this.setEvent()
  }

  // 종속성 초기화
  init (core) {
    JSLog('Class Event init')
    this.core = core
  }

  setEvent () {
    // 오른쪽 클릭 이벤트
    window.addEventListener('contextmenu', function (e) {
      e.preventDefault()
      this.core.event.onRightClick(e)
    }.bind(this))
    // 페이지 이동시 경고창
    // window.onbeforeunload = e => {
    //   const dialogText = 'Dialog text here';
    //   e.returnValue = dialogText;
    //   return dialogText;
    // }
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
  cursor (type) {
    if (type) {
      $('body').css('cursor', `url("/img/erd/${type}.png") 16 16, auto`)
      this.isCursor = true
      this.type = type
    } else {
      $('body').removeAttr('style')
      this.isCursor = false
      this.type = null
      if (this.isDraw) {
        this.endCursor()
      }
    }
  }

  // 연결 시작
  startCursor (id) {
    this.lineId = id
    this.eventTarget = this.mouseMove.bind({
      id: id
    })
    $(document).mousemove(this.eventTarget)
    this.isDraw = true
  }

  // 연결 종료
  endCursor (id) {
    $(document).off('mousemove', this.eventTarget)
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
            ui: {
              key: {
                fk: true
              }
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

      this.cursor()
    } else {
      storeERD.commit({
        type: 'lineDelete',
        id: this.lineId
      })
    }
    this.lineId = null
  }

  // 마우스 이동 콜백
  mouseMove (e) {
    storeERD.commit({
      type: 'lineDraw',
      id: this.id,
      x: e.clientX + document.documentElement.scrollLeft,
      y: e.clientY + document.documentElement.scrollTop
    })
  }
}

export default new Event()
