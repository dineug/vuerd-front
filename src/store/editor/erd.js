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
export default () => {
  return new Vuex.Store({
    state: {
      TABLE_WIDTH: 460,
      TABLE_HEIGHT: 98,
      COLUMN_HEIGHT: 25,
      DBType: 'MySQL',
      dataTypes: dataType['MySQL'],
      tables: [],
      lines: []
    },
    mutations: {
      // DB 변경
      changeDB (state, data) {
        JSLog('mutations', 'erd', 'changeDB')
        state.DBType = data.DBType
        state.dataTypes = dataType[data.DBType]
      },
      // 데이터타입 검색
      changeDataTypeHint (state, data) {
        JSLog('mutations', 'erd', 'changeDataTypeHint')
        state.dataTypes = dataType[state.DBType].filter(v => {
          return v.name.toLowerCase().indexOf(data.key.toLowerCase()) !== -1
        })
      },
      // 전체 import
      importData (state, data) {
        Object.keys(state).forEach(key => {
          state[key] = data.state[key]
        })
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
      // 테이블 및 컬럼 selected All 해제
      tableSelectedAllNone: table.selectedAllNone,
      // 테이블 드래그 multi selected
      tableMultiSelected: table.multiSelected,
      // 테이블 전체 선택
      tableSelectedAll: table.selectedAll,
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
      columnDataTypeHintVisible: column.dataTypeHintVisible,
      // 컬럼 데이터타입 힌트 show/hide ALL
      columnDataTypeHintVisibleAll: column.dataTypeHintVisibleAll,
      // 컬럼 데이터타입 관계 동기화
      columnRelationSync: column.relationSync,
      // 관계 생성
      lineAdd: line.add,
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
}
