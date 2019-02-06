import JSLog from '@/js/JSLog'
import * as util from '@/js/editor/util'

JSLog('store loaded', 'mutationsLine')

export default {
  // line drawing
  draw (state, data) {
    JSLog('mutations', 'line', 'draw')
    const line = util.getData(state.lines, data.id)
    line.points[1].x = data.x
    line.points[1].y = data.y
    line.points[0].columnIds = data.startColumnIds
    line.points[1].columnIds = data.endColumnIds
    if (data.tableId) line.points[1].id = data.tableId
  },
  // line 삭제
  delete (state, data) {
    JSLog('mutations', 'line', 'delete')
    for (let i in state.lines) {
      if (data.id === state.lines[i].id) {
        state.lines.splice(i, 1)
        break
      }
    }
  },
  // line 식별, 비식별 변경
  changeIdentification (state, data) {
    JSLog('mutations', 'line', 'changeIdentification')
    const line = util.getData(state.lines, data.id)
    line.isIdentification = data.isIdentification
  }
}
