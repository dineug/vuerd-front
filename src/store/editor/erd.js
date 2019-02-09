import JSLog from '@/js/JSLog'
import Vue from 'vue'
import Vuex from 'vuex'
import dataType from './dataType'
import table from './mutationsTable'
import column from './mutationsColumn'
import line from './mutationsLine'

JSLog('store loaded', 'erd')
Vue.use(Vuex)

// ERD 데이터
export default new Vuex.Store({
  state: {
    DBType: 'MySQL',
    tables: [],
    lines: [],
    TABLE_WIDTH: 630,
    TABLE_HEIGHT: 88,
    COLUMN_HEIGHT: 25
  },
  mutations: {
    // DB 변경
    changeDB (state, data) {
      state.DBType = data.DBType
      for (let table of state.tables) {
        for (let column of table.columns) {
          column.ui.dataTypes = dataType[data.DBType]
        }
      }
    },
    // 테이블 추가
    tableAdd: table.add,
    // 테이블 삭제
    tableDelete: table.delete,
    // 테이블 높이 리셋
    tableHeightReset: table.heightReset,
    // 테이블 선택
    tableSelected: table.selected,
    // 테이블 top, left 변경
    tableDraggable: table.draggable,
    // 컬럼 추가
    columnAdd: column.add,
    // 컬럼 삭제
    columnDelete: column.delete,
    // 컬럼 NULL 조건 변경
    columnChangeNull: column.changeNull,
    // 컬럼 선택
    columnSelected: column.selected,
    // 컬럼 key active
    columnKey: column.key,
    // 컬럼 데이터변경
    columnChangeDataType: column.changeDataType,
    // 컬럼 데이터타입 힌트 show/hide
    dataTypeHintVisible: column.dataTypeHintVisible,
    // 컬럼 데이터타입 힌트 show/hide ALL
    dataTypeHintVisibleAll: column.dataTypeHintVisibleAll,
    // 컬럼 데이터타입 검색
    changeDataTypeHint: column.changeDataTypeHint,
    // 컬럼 데이터타입 관계 동기화
    columnRelationSync: column.relationSync,
    // 관계 drawing
    lineDraw: line.draw,
    // 관계 삭제
    lineDelete: line.delete,
    // 관계 식별, 비식별 변경
    lineChangeIdentification: line.changeIdentification,
    // 관계 컬럼 이동 유효성
    lineValidColumn: line.validColumn,
    // 관계 컬럼 hover 처리
    lineHover: line.hover
  }
})
