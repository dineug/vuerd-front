import JSLog from '../JSLog'
import ERD from './ERD'
import dataType from '@/store/editor/dataType'

JSLog('module loaded', 'util')

export const svgCheck = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-check fa-w-16"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg>`

// UUID 생성
export const guid = () => {
  const s4 = () => {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1)
  }

  return [s4(), s4(), '-', s4(), '-', s4(), '-', s4(), '-', s4(), s4(), s4()].join('')
}

// id -> data 반환
export const getData = (list, id) => {
  for (let v of list) {
    if (id === v.id) {
      return v
    }
  }
}

// option 검색
export const getDataTypeSearch = key => {
  const DBType = ERD.store().state.DBType
  const dataTypes = dataType[DBType].slice()

  for (let i = 0; i < dataTypes.length; i++) {
    let check = true

    if (dataTypes[i].name.toLowerCase().indexOf(key.toLowerCase()) !== -1) {
      check = false
    }
    if (check) {
      dataTypes.splice(i, 1)
      i--
    }
  }
  return dataTypes
}

// max z-index 반환
export const getZIndex = () => {
  let max = 0

  ERD.store().state.tables.forEach(v => {
    if (v.ui.zIndex > max) {
      max = v.ui.zIndex
    }
  })
  return ++max
}

// 자동 이름 생성 column, table
export const autoName = (list, name, num) => {
  if (!num) num = 1
  for (let v of list) {
    if (name === v.name) {
      return autoName(list, name.replace(/[0-9]/g, '') + num, num + 1)
    }
  }
  return name
}

// 테이블 pk 컬럼 리스트 반환
export const getPKColumns = id => {
  const table = getData(ERD.store().state.tables, id)
  const columns = []

  for (let column of table.columns) {
    if (column.options.primaryKey) {
      columns.push(column)
    }
  }
  return columns
}

// 데이터 셋팅
export const initData = (oldData, newData) => {
  Object.keys(newData).forEach(key => {
    if (typeof newData[key] === 'object') {
      initData(oldData[key], newData[key])
    } else {
      oldData[key] = newData[key]
    }
  })
}

// PrimaryKey check
export const tableIsPrimaryKey = columns => {
  let isPK = false

  for (let column of columns) {
    if (column.options.primaryKey) {
      isPK = true
      break
    }
  }
  return isPK
}

// 컬럼 데이터타입 동기체크
export const columnIsRelationSync = (state, tableId, column) => {
  let isSync = false

  for (let line of state.lines) {
    let isTarget = false

    if (line.points[0].id === tableId) {
      for (let i in line.points[0].columnIds) {
        if (column.id === line.points[0].columnIds[i]) {
          const targetTable = getData(state.tables, line.points[1].id)
          const targetColumn = getData(targetTable.columns, line.points[1].columnIds[i])
          isSync = column.dataType !== targetColumn.dataType
          isTarget = true
          break
        }
      }
    }
    if (line.points[1].id === tableId) {
      for (let i in line.points[1].columnIds) {
        if (column.id === line.points[1].columnIds[i]) {
          const targetTable = getData(state.tables, line.points[0].id)
          const targetColumn = getData(targetTable.columns, line.points[0].columnIds[i])
          isSync = column.dataType !== targetColumn.dataType
          isTarget = true
          break
        }
      }
    }
    if (isTarget) break
  }
  return isSync
}

// 동기화할 관계 컬럼 탐색
export const getSyncColumns = (columns, lines, state, tableId, column) => {
  let targetTable = null
  let targetColumn = null
  let targetIndex = null

  for (let i in lines) {
    let isTarget = false

    if (lines[i].points[0].id === tableId) {
      for (let j in lines[i].points[0].columnIds) {
        if (column.id === lines[i].points[0].columnIds[j]) {
          targetTable = getData(state.tables, lines[i].points[1].id)
          targetColumn = getData(targetTable.columns, lines[i].points[1].columnIds[j])
          isTarget = true
          break
        }
      }
      targetIndex = i
    }
    if (lines[i].points[1].id === tableId) {
      for (let j in lines[i].points[1].columnIds) {
        if (column.id === lines[i].points[1].columnIds[j]) {
          targetTable = getData(state.tables, lines[i].points[0].id)
          targetColumn = getData(targetTable.columns, lines[i].points[0].columnIds[j])
          isTarget = true
          break
        }
      }
      targetIndex = i
    }
    if (isTarget) break
  }
  // 탐색 완료 관계 목록 제거
  lines.splice(targetIndex, 1)

  if (isLineSync(columns, lines, state, tableId, column)) {
    // 탐색한 컬럼 중첩 검색
    getSyncColumns(columns, lines, state, tableId, column)
  }

  // 관계 상대방 탐색
  if (targetTable !== null) {
    columns.push(targetColumn)
    getSyncColumns(columns, lines, state, targetTable.id, targetColumn)
  }
}

// 탐색할 관계 있는지 확인
function isLineSync (columns, lines, state, tableId, column) {
  let isRelation = false

  for (let i in lines) {
    if (lines[i].points[0].id === tableId) {
      for (let j in lines[i].points[0].columnIds) {
        if (column.id === lines[i].points[0].columnIds[j]) {
          isRelation = true
          break
        }
      }
      break
    }
    if (lines[i].points[1].id === tableId) {
      for (let j in lines[i].points[1].columnIds) {
        if (column.id === lines[i].points[1].columnIds[j]) {
          isRelation = true
          break
        }
      }
      break
    }
  }

  return isRelation
}

// 관계 식별, 비식별 변경
export const changeIdentification = (state, table) => {
  for (let line of state.lines) {
    if (line.points[1].id === table.id) {
      let isPk = true
      for (let columnId of line.points[1].columnIds) {
        for (let column of table.columns) {
          if (column.id === columnId) {
            if (!column.options.primaryKey) isPk = false
            break
          }
        }
        if (!isPk) break
      }
      ERD.store().commit({
        type: 'lineChangeIdentification',
        id: line.id,
        isIdentification: isPk
      })
    }
  }
}

// line convert
export const convertLine = v => {
  // start,end key 및 points data convert
  const key = convertPoints(v)
  // path data
  const path = getPath(v, key)
  // line data
  const line = getLine(v, key)

  return {
    id: v.id,
    type: v.type,
    isIdentification: v.isIdentification,
    key: key,
    path: path,
    line: line.line,
    circle: line.circle,
    isDraw: key.end != null
  }
}

// 좌표 데이터 정제
export const getPoint = (ui) => {
  return {
    width: ui.width,
    height: ui.height,
    x: ui.left,
    y: ui.top,
    top: {
      x: ui.left + (ui.width / 2),
      y: ui.top
    },
    bottom: {
      x: ui.left + (ui.width / 2),
      y: ui.top + ui.height
    },
    left: {
      x: ui.left,
      y: ui.top + (ui.height / 2)
    },
    right: {
      x: ui.left + ui.width,
      y: ui.top + (ui.height / 2)
    },
    lt: {
      x: ui.left,
      y: ui.top
    },
    rt: {
      x: ui.left + ui.width,
      y: ui.top
    },
    lb: {
      x: ui.left,
      y: ui.top + ui.height
    },
    rb: {
      x: ui.left + ui.width,
      y: ui.top + ui.height
    }
  }
}

// convert points
function convertPoints (v) {
  const startTable = getData(ERD.store().state.tables, v.points[0].id)
  const endTable = getData(ERD.store().state.tables, v.points[1].id)
  const startPoint = getPoint(startTable.ui)
  const key = {
    start: 'left',
    end: null,
    startPoint: startPoint,
    endPoint: null
  }

  const filter = it => {
    return it === 'left' || it === 'right' || it === 'top' || it === 'bottom'
  }

  // 연결좌표 처리
  if (endTable && v.points[0].id === v.points[1].id) {
    // self
    const endPoint = key.endPoint = getPoint(endTable.ui)
    key.start = 'top'
    key.end = 'right'
    v.points[0].x = startPoint.rt.x - 20
    v.points[0].y = startPoint.rt.y
    v.points[1].x = endPoint.rt.x
    v.points[1].y = endPoint.rt.y + 20
  } else if (endTable) {
    key.end = 'left'
    const endPoint = key.endPoint = getPoint(endTable.ui)
    let minXY = Math.abs(startPoint.left.x - endPoint.left.x) + Math.abs(startPoint.left.y - endPoint.left.y)
    v.points[0].x = startPoint.left.x
    v.points[0].y = startPoint.left.y
    v.points[1].x = endPoint.left.x
    v.points[1].y = endPoint.left.y

    Object.keys(startPoint).filter(filter).forEach(function (k) {
      Object.keys(endPoint).filter(filter).forEach(function (k2) {
        let tempXY = Math.abs(startPoint[k].x - endPoint[k2].x) + Math.abs(startPoint[k].y - endPoint[k2].y)
        if (minXY > tempXY) {
          minXY = tempXY
          key.start = k
          key.end = k2
          v.points[0].x = startPoint[k].x
          v.points[0].y = startPoint[k].y
          v.points[1].x = endPoint[k2].x
          v.points[1].y = endPoint[k2].y
        }
      })
    })
  } else {
    let minXY = Math.abs(startPoint.left.x - v.points[1].x) + Math.abs(startPoint.left.y - v.points[1].y)
    v.points[0].x = startPoint.left.x
    v.points[0].y = startPoint.left.y

    Object.keys(startPoint).filter(filter).forEach(function (k) {
      let tempXY = Math.abs(startPoint[k].x - v.points[1].x) + Math.abs(startPoint[k].y - v.points[1].y)
      if (minXY > tempXY) {
        minXY = tempXY
        key.start = k
        v.points[0].x = startPoint[k].x
        v.points[0].y = startPoint[k].y
      }
    })
  }

  return key
}

// path data
const PATH_HEIGHT = 40
const PATH_END_HEIGHT = PATH_HEIGHT + 20
const PATH_LINE_HEIGHT = 35

function getPath (v, key) {
  const line = {
    start: {
      x1: v.points[0].x,
      y1: v.points[0].y,
      x2: v.points[0].x,
      y2: v.points[0].y
    },
    end: {
      x1: v.points[1].x,
      y1: v.points[1].y,
      x2: v.points[1].x,
      y2: v.points[1].y
    }
  }
  const path = {
    M: { x: 0, y: 0 },
    L: { x: 0, y: 0 },
    Q: { x: 0, y: 0 }
  }
  let change = 1

  if (key.start === 'left' || key.start === 'right') {
    if (key.start === 'left') change *= -1
    line.start.x2 = v.points[0].x + (change * PATH_HEIGHT)
    path.M.x = line.start.x2
    path.M.y = v.points[0].y
  } else if (key.start === 'top' || key.start === 'bottom') {
    if (key.start === 'top') change *= -1
    line.start.y2 = v.points[0].y + (change * PATH_HEIGHT)
    path.M.x = v.points[0].x
    path.M.y = line.start.y2
  }

  if (key.end) {
    change = 1
    if (key.end === 'left' || key.end === 'right') {
      if (key.end === 'left') change *= -1
      line.end.x2 = v.points[1].x + (change * PATH_END_HEIGHT)
      line.end.x1 += (change * PATH_LINE_HEIGHT)
      path.L.x = line.end.x2
      path.L.y = v.points[1].y
    } else if (key.end === 'top' || key.end === 'bottom') {
      if (key.end === 'top') change *= -1
      line.end.y2 = v.points[1].y + (change * PATH_END_HEIGHT)
      line.end.y1 += (change * PATH_LINE_HEIGHT)
      path.L.x = v.points[1].x
      path.L.y = line.end.y2
    }
  } else {
    path.L.x = v.points[1].x
    path.L.y = v.points[1].y
  }

  return {
    path: path,
    d: () => {
      return `M ${path.M.x} ${path.M.y} L ${path.L.x} ${path.L.y}`
    },
    line: line
  }
}

// line data
const LINE_SIZE = 10
const LINE_HEIGHT = 15
const CIRCLE_HEIGHT = 26

function getLine (v, key) {
  const line = {
    start: {
      x1: v.points[0].x,
      y1: v.points[0].y,
      x2: v.points[0].x,
      y2: v.points[0].y
    },
    end: {
      base: {
        x1: v.points[1].x,
        y1: v.points[1].y,
        x2: v.points[1].x,
        y2: v.points[1].y
      },
      left: {
        x1: v.points[1].x,
        y1: v.points[1].y,
        x2: v.points[1].x,
        y2: v.points[1].y
      },
      center: {
        x1: v.points[1].x,
        y1: v.points[1].y,
        x2: v.points[1].x,
        y2: v.points[1].y
      },
      right: {
        x1: v.points[1].x,
        y1: v.points[1].y,
        x2: v.points[1].x,
        y2: v.points[1].y
      }
    }
  }
  let change = 1

  if (key.start === 'left' || key.start === 'right') {
    if (key.start === 'left') change *= -1
    line.start.x1 = line.start.x2 += (change * LINE_HEIGHT)
    line.start.y1 -= LINE_SIZE
    line.start.y2 += LINE_SIZE
  } else if (key.start === 'top' || key.start === 'bottom') {
    if (key.start === 'top') change *= -1
    line.start.y1 = line.start.y2 += (change * LINE_HEIGHT)
    line.start.x1 -= LINE_SIZE
    line.start.x2 += LINE_SIZE
  }

  const circle = {
    cx: v.points[1].x,
    cy: v.points[1].y
  }

  if (key.end) {
    change = 1
    if (key.end === 'left' || key.end === 'right') {
      if (key.end === 'left') change *= -1
      line.end.left.x1 = line.end.center.x1 = line.end.right.x1 = line.end.base.x1 = line.end.base.x2 += (change * LINE_HEIGHT)
      line.end.base.y1 -= LINE_SIZE
      line.end.base.y2 += LINE_SIZE
      line.end.left.y2 += LINE_SIZE
      line.end.right.y2 -= LINE_SIZE

      circle.cx += (change * CIRCLE_HEIGHT)
    } else if (key.end === 'top' || key.end === 'bottom') {
      if (key.end === 'top') change *= -1
      line.end.left.y1 = line.end.center.y1 = line.end.right.y1 = line.end.base.y1 = line.end.base.y2 += (change * LINE_HEIGHT)
      line.end.base.x1 -= LINE_SIZE
      line.end.base.x2 += LINE_SIZE
      line.end.left.x2 += LINE_SIZE
      line.end.right.x2 -= LINE_SIZE

      circle.cy += (change * CIRCLE_HEIGHT)
    }
  }

  return {
    line: line,
    circle: circle
  }
}

// 위치 중첩 재가공
export const convertPointOverlay = arr => {
  const count = arr.length
  const point = pointOverlay(arr[0], count)

  for (let i in arr) {
    if (arr[i].type === 'start') {
      let key = 'x'
      if (arr[i].data.key.start === 'left' || arr[i].data.key.start === 'right') {
        key = 'y'
      }
      const key1 = key + '1'
      const key2 = key + '2'
      const keyArr = key + 'Arr'

      arr[i].data.path.line.start[key1] = point[keyArr][i]
      arr[i].data.path.line.start[key2] = point[keyArr][i]
      arr[i].data.line.start[key1] = point[keyArr][i] - LINE_SIZE
      arr[i].data.line.start[key2] = point[keyArr][i] + LINE_SIZE
      arr[i].data.path.path.M[key] = point[keyArr][i]
    } else if (arr[i].type === 'end') {
      let key = 'x'
      if (arr[i].data.key.end === 'left' || arr[i].data.key.end === 'right') {
        key = 'y'
      }
      const key1 = key + '1'
      const key2 = key + '2'
      const keyArr = key + 'Arr'
      const keyc = 'c' + key

      arr[i].data.path.line.end[key1] = point[keyArr][i]
      arr[i].data.path.line.end[key2] = point[keyArr][i]
      arr[i].data.circle[keyc] = point[keyArr][i]
      arr[i].data.line.end.base[key1] = point[keyArr][i] - LINE_SIZE
      arr[i].data.line.end.base[key2] = point[keyArr][i] + LINE_SIZE
      arr[i].data.line.end.left[key1] = point[keyArr][i]
      arr[i].data.line.end.left[key2] = point[keyArr][i] + LINE_SIZE
      arr[i].data.line.end.center[key1] = point[keyArr][i]
      arr[i].data.line.end.center[key2] = point[keyArr][i]
      arr[i].data.line.end.right[key1] = point[keyArr][i]
      arr[i].data.line.end.right[key2] = point[keyArr][i] - LINE_SIZE
      arr[i].data.path.path.L[key] = point[keyArr][i]
    }
  }
}

function pointOverlay (v, count) {
  const point = v.type === 'start' ? v.data.key.startPoint : v.data.key.endPoint
  const margin = {
    x: point.width / count,
    y: point.height / count
  }
  const padding = {
    x: margin.x / 2,
    y: margin.y / 2
  }

  const xArr = []
  const yArr = []

  if (v.type === 'start') {
    if (v.data.key.start === 'left' || v.data.key.start === 'right') {
      let sum = point.y - padding.y
      for (let i = 0; i < count; i++) {
        sum += margin.y
        yArr.push(sum)
      }
    } else if (v.data.key.start === 'top' || v.data.key.start === 'bottom') {
      let sum = point.x - padding.x
      for (let i = 0; i < count; i++) {
        sum += margin.x
        xArr.push(sum)
      }
    }
  } else if (v.type === 'end') {
    if (v.data.key.end === 'left' || v.data.key.end === 'right') {
      let sum = point.y - padding.y
      for (let i = 0; i < count; i++) {
        sum += margin.y
        yArr.push(sum)
      }
    } else if (v.data.key.end === 'top' || v.data.key.end === 'bottom') {
      let sum = point.x - padding.x
      for (let i = 0; i < count; i++) {
        sum += margin.x
        xArr.push(sum)
      }
    }
  }

  return {
    xArr: xArr,
    yArr: yArr
  }
}
