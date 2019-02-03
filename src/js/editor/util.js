import $ from 'jquery'
import storeERD from '@/store/editor/erd'
import dataType from '@/store/editor/dataType'

// UUID 생성
export const guid = () => {
  function s4 () {
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
  const DBType = storeERD.state.DBType
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
export const getZIndex = el => {
  let max = 0
  $(el).each(function () {
    const zIndex = Number($(this).css('z-index'))
    if (max < zIndex) {
      max = zIndex
    }
  })
  return ++max
}

// z-index 콜백 함수
export const setZIndex = function () {
  $(this).css('z-index', getZIndex('.erd_table'))
}

// dataTypeHint show/hide 콜백 함수
export const setDataTypeHint = function (e) {
  if (!$(e.target).closest('.erd_data_type_list').length) {
    storeERD.commit({
      type: 'dataTypeHintVisibleAll',
      isDataTypeHint: false
    })
  }
}

// 자동 이름 생성 column, table
export const autoName = (list, name, num) => {
  if (!num) num = 1
  for (let v of list) {
    if (name === v.name) {
      return autoName(list, name + num, num + 1)
    }
  }
  return name
}

// 테이블 pk 컬럼 리스트 반환
export const getPKColumns = id => {
  const table = getData(storeERD.state.tables, id)
  const columns = []
  for (let column of table.columns) {
    if (column.options.primaryKey) {
      columns.push(column)
    }
  }
  return columns
}

// column 데이터 셋팅
export const initColumn = (column, dColumn) => {
  Object.keys(dColumn).forEach(key => {
    if (typeof dColumn[key] === 'object') {
      initColumn(column[key], dColumn[key])
    } else {
      column[key] = dColumn[key]
    }
  })
}

// column 선택 초기화
export const columnSelectedNone = state => {
  state.tables.forEach(table => {
    table.columns.forEach(v => {
      v.ui.selected = false
    })
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
    path: path,
    line: line.line,
    circle: line.circle,
    isDraw: key.end != null
  }
}

// 좌표 데이터 정제
function getPoint (ui) {
  return {
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
  const startTable = getData(storeERD.state.tables, v.points[0].id)
  const endTable = getData(storeERD.state.tables, v.points[1].id)
  const key = {
    start: 'left',
    end: null
  }
  const startPoint = getPoint(startTable.ui)

  const filter = it => {
    return it === 'left' || it === 'right' || it === 'top' || it === 'bottom'
  }

  // 연결좌표 처리
  if (endTable && v.points[0].id === v.points[1].id) {
    // self
    const endPoint = getPoint(endTable.ui)
    key.start = 'top'
    key.end = 'right'
    v.points[0].x = startPoint.rt.x - 20
    v.points[0].y = startPoint.rt.y
    v.points[1].x = endPoint.rt.x
    v.points[1].y = endPoint.rt.y + 20
  } else if (endTable) {
    const endPoint = getPoint(endTable.ui)
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
  const path = []
  let change = 1

  if (key.start === 'left' || key.start === 'right') {
    if (key.start === 'left') change *= -1
    line.start.x2 = v.points[0].x + (change * PATH_HEIGHT)
    path.push(`M${line.start.x2} ${v.points[0].y}`)
  } else if (key.start === 'top' || key.start === 'bottom') {
    if (key.start === 'top') change *= -1
    line.start.y2 = v.points[0].y + (change * PATH_HEIGHT)
    path.push(`M${v.points[0].x} ${line.start.y2}`)
  }

  if (v.points[0].id === v.points[1].id) {
    path.push(`Q ${v.points[0].x + PATH_END_HEIGHT} ${v.points[0].y - PATH_HEIGHT}`)
  } else if (key.start === 'left' || key.start === 'right') {
    path.push(`Q ${(v.points[0].x + v.points[1].x) / 2} ${v.points[0].y}`)
  } else {
    path.push(`Q ${v.points[0].x} ${(v.points[0].y + v.points[1].y) / 2}`)
  }

  if (key.end) {
    change = 1
    if (key.end === 'left' || key.end === 'right') {
      if (key.end === 'left') change *= -1
      line.end.x2 = v.points[1].x + (change * PATH_END_HEIGHT)
      line.end.x1 += (change * PATH_LINE_HEIGHT)
      path.push(`${line.end.x2} ${v.points[1].y}`)
    } else if (key.end === 'top' || key.end === 'bottom') {
      if (key.end === 'top') change *= -1
      line.end.y2 = v.points[1].y + (change * PATH_END_HEIGHT)
      line.end.y1 += (change * PATH_LINE_HEIGHT)
      path.push(`${v.points[1].x} ${line.end.y2}`)
    }
  } else {
    path.push(`${v.points[1].x} ${v.points[1].y}`)
  }

  return {
    path: path.join(' '),
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
