<template lang="pug">
  .main_canvas(v-if="!isPreview")
    // mouse drag
    svg.svg_drag(v-if="svg.isDarg"
    :style="`top: ${svg.top}px; left: ${svg.left}px; width: ${svg.width}px; height: ${svg.height}px;`")
      rect(:width="svg.width" :height="svg.height"
      stroke="#0098ff" stroke-width="1" stroke-opacity="0.9" stroke-dasharray="3"
      fill-opacity="0.3")

    // 테이블
    .erd_table(v-for="table in tables" :key="table.id" :table_id="table.id"
    :class="{ selected: table.ui.selected}"
    :style="`width: ${TABLE_WIDTH}px; top: ${table.ui.top}px; left: ${table.ui.left}px; z-index: ${table.ui.zIndex};`"
    @mousedown="tableSelected($event, table.id)")

      // 테이블 해더
      .erd_table_top
        button(title="Alt + Delete"
        @click="tableDelete(table.id)")
          font-awesome-icon(icon="times")

        button(title="Alt + Enter"
        @click="columnAdd(table.id)")
          font-awesome-icon(icon="plus")

      .erd_table_header
        input(v-model="table.name" v-focus
        type="text" placeholder="table"
        @keyup="onChangeTableGrid(table.id)"
        @keyup.enter="onEnterMove($event, 'tableName')")

        input(v-model="table.comment"
        type="text" placeholder="comment"
        @keyup.enter="onEnterMove($event, 'tableComment', table.id)")

      draggable(v-model="table.columns" :options="{group:'table'}"
      @end="draggableEnd")

        // 컬럼
        .erd_column(v-for="column in table.columns" :key="column.id" :column_id="column.id"
        :class="{ selected: column.ui.selected, relation_active: column.ui.isHover}"
        :style="`height: ${COLUMN_HEIGHT}px;`"
        @mousedown.stop="onColumnSelected($event, table.id, column.id)")

          // 컬럼 key
          .erd_column_key(:class="{ pk: column.ui.pk, fk: column.ui.fk, pfk: column.ui.pfk }")
            font-awesome-icon(icon="key")

          // 컬럼 이름
          input(v-model="column.name" v-focus :id="`columnName_${column.id}`"
          type="text" placeholder="column"
          @keyup="onChangeTableGrid(table.id)"
          @keyup.enter="onEnterMove($event, 'columnName')"
          @keydown="onKeyArrowMove"
          @focus="columnSelected(table.id, column.id)")

          // 컬럼 데이터타입
          div
            input.erd_data_type(v-model="column.dataType"
            type="text" placeholder="dataType"
            @keyup="dataTypeHintVisible($event, table.id, column.id, true)"
            @keydown="dataTypeHintFocus($event, table.id, column.id)"
            @focus="columnSelected(table.id, column.id)")

            transition-group.erd_data_type_list(v-if="column.ui.isDataTypeHint"
            tag="ul"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @leave="onLeave")
              li(v-for="dataType in dataTypes" :key="dataType.name"
              @click="columnChangeDataType($event, table.id, column.id, dataType.name)"
              @mouseover="dataTypeHintAddClass") {{ dataType.name }}

          // 컬럼 not-null
          input.erd_column_not_null(v-if="column.options.notNull"
          type="text" readonly value="N-N"
          @click="columnChangeNull(table.id, column.id)"
          @keyup.32="columnChangeNull(table.id, column.id)"
          @keyup.enter="onEnterMove($event, 'columnNotNull')"
          @keydown="onKeyArrowMove"
          @focus="columnSelected(table.id, column.id)")
          input.erd_column_not_null(v-else
          type="text" readonly value="NULL"
          @click="columnChangeNull(table.id, column.id)"
          @keyup.32="columnChangeNull(table.id, column.id)"
          @keyup.enter="onEnterMove($event, 'columnNotNull')"
          @keydown="onKeyArrowMove"
          @focus="columnSelected(table.id, column.id)")

          // 컬럼 comment
          input(v-model="column.comment"
          type="text" placeholder="comment"
          @keyup="onChangeTableGrid(table.id)"
          @keyup.enter="onEnterMove($event, 'columnComment', table.id, column.id)"
          @keydown="onKeyArrowMove"
          @focus="columnSelected(table.id, column.id)")

          // 컬럼 삭제 버튼
          button(title="Delete"
          @click="columnDelete(table.id, column.id)")
            font-awesome-icon(icon="times")

  // ========================================== 미리보기 영역 이벤트 중첩방지 ==========================================
  .main_canvas(v-else)
    svg.svg_drag(v-if="svg.isDarg" :style="`top: ${svg.top}px; left: ${svg.left}px; width: ${svg.width}px; height: ${svg.height}px;`")
      rect(:width="svg.width" :height="svg.height" stroke="#0098ff" stroke-width="1" stroke-opacity="0.9" stroke-dasharray="3" fill-opacity="0.3")
    .erd_table(v-for="table in tables" :key="table.id" :table_id="table.id" :class="{ selected: table.ui.selected}" :style="`width: ${TABLE_WIDTH}px; top: ${table.ui.top}px; left: ${table.ui.left}px; z-index: ${table.ui.zIndex};`")
      .erd_table_top
        button
          font-awesome-icon(icon="times")
        button
          font-awesome-icon(icon="plus")
      .erd_table_header
        input(v-model="table.name" type="text" placeholder="table")
        input(v-model="table.comment" type="text" placeholder="comment")
      .erd_column(v-for="column in table.columns" :key="column.id" :column_id="column.id" :class="{ selected: column.ui.selected, relation_active: column.ui.isHover}" :style="`height: ${COLUMN_HEIGHT}px;`")
        .erd_column_key(:class="{ pk: column.ui.pk, fk: column.ui.fk, pfk: column.ui.pfk }")
          font-awesome-icon(icon="key")
        input(v-model="column.name" type="text" placeholder="column")
        div
          input.erd_data_type(v-model="column.dataType" type="text" placeholder="dataType")
        input.erd_column_not_null(v-if="column.options.notNull" type="text" readonly value="N-N")
        input.erd_column_not_null(v-else type="text" readonly value="NULL")
        input(v-model="column.comment" type="text" placeholder="comment")
        button(title="Delete")
          font-awesome-icon(icon="times")
</template>

<script>
import $ from 'jquery'
import ERD from '@/js/editor/ERD'
import storeTable from '@/store/editor/table'
import draggable from 'vuedraggable'
import Velocity from 'velocity-animate'
import * as util from '@/js/editor/util'

export default {
  name: 'CanvasMain',
  components: {
    draggable
  },
  directives: {
    // focus 정의
    focus: {
      inserted (el) {
        if (ERD.core.event.isEdit) {
          el.focus()
          ERD.core.event.isEdit = false
        }
      }
    }
  },
  props: {
    isPreview: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      svg: {
        isDarg: false,
        top: 0,
        left: 0,
        width: 0,
        height: 0
      }
    }
  },
  computed: {
    tables () {
      return ERD.store().state.tables
    },
    TABLE_WIDTH () {
      return ERD.store().state.TABLE_WIDTH
    },
    COLUMN_HEIGHT () {
      return ERD.store().state.COLUMN_HEIGHT
    },
    dataTypes () {
      return ERD.store().state.dataTypes
    }
  },
  methods: {
    // 컬럼 추가
    columnAdd (id) {
      ERD.store().commit({
        type: 'columnAdd',
        id: id
      })
    },
    // 컬럼 삭제
    columnDelete (tableId, columnId) {
      ERD.store().commit({
        type: 'columnDelete',
        tableId: tableId,
        columnId: columnId
      })
    },
    // NULL 조건 변경
    columnChangeNull (tableId, columnId) {
      ERD.store().commit({
        type: 'columnChangeNull',
        tableId: tableId,
        columnId: columnId
      })
      this.onChangeTableGrid(tableId)
    },
    // 테이블 삭제
    tableDelete (id) {
      ERD.store().commit({
        type: 'tableDelete',
        id: id
      })
    },
    // 테이블 선택
    tableSelected (e, id) {
      ERD.core.event.isSelectedColumn = false
      ERD.store().commit({
        type: 'tableSelected',
        id: id,
        ctrlKey: e.ctrlKey,
        isEvent: true
      })
    },
    // 컬럼 선택 전역
    onColumnSelected (e, tableId, columnId) {
      // 데이터 타입 힌트 hide
      if (!$(e.target).closest('.erd_data_type_list').length) {
        ERD.core.erd.store().commit({
          type: 'columnDataTypeHintVisibleAll',
          isDataTypeHint: false
        })
      }
      ERD.store().commit({
        type: 'tableSelected',
        id: tableId,
        isColumnSelected: true
      })
      this.columnSelected(tableId, columnId)
    },
    // 컬럼 선택
    columnSelected (tableId, columnId) {
      ERD.store().commit({
        type: 'columnSelected',
        tableId: tableId,
        columnId: columnId
      })
      ERD.core.event.isSelectedColumn = true
    },
    // 데이터타입 힌트 show/hide
    dataTypeHintVisible (e, tableId, columnId, isDataTypeHint) {
      if (e.keyCode === 27) { // key: ESC
        ERD.store().commit({
          type: 'columnDataTypeHintVisibleAll',
          isDataTypeHint: false
        })
      } else {
        ERD.store().commit({
          type: 'columnDataTypeHintVisible',
          tableId: tableId,
          columnId: columnId,
          isDataTypeHint: isDataTypeHint
        })
      }

      if (e.keyCode !== 38 && e.keyCode !== 40) {
        // 데이터타입 검색 정렬
        if (isDataTypeHint) {
          ERD.store().commit({
            type: 'changeDataTypeHint',
            key: e.target.value
          })
        }
      }

      // 컬럼 데이터타입 관계 동기화
      ERD.store().commit({
        type: 'columnRelationSync',
        tableId: tableId,
        columnId: columnId
      })

      this.onChangeTableGrid(tableId)
    },
    // 데이터 타입 힌트 포커스
    dataTypeHintFocus (e, tableId, columnId) {
      // 힌트 포커스 이동
      const $li = $(e.target).parent('div').find('li')
      const index = $li.filter('.selected').index()
      const len = $li.length
      switch (e.keyCode) {
        case 38: // key: Arrow up
          e.preventDefault()
          if (index === -1) {
            $li.eq(len - 1).addClass('selected')
          } else {
            $li.eq(index).removeClass('selected')
            $li.eq(index - 1).addClass('selected')
          }
          break
        case 40: // key: Arrow down
          e.preventDefault()
          if (index === -1) {
            $li.eq(0).addClass('selected')
          } else {
            $li.eq(index).removeClass('selected')
            $li.eq(index + 1 === len ? 0 : index + 1).addClass('selected')
          }
          break
        case 13: // key: Enter
          if (e.altKey) {
            ERD.store().commit({
              type: 'columnDataTypeHintVisibleAll',
              isDataTypeHint: false
            })
          } else {
            if (index !== -1) {
              ERD.store().commit({
                type: 'columnChangeDataType',
                tableId: tableId,
                columnId: columnId,
                dataType: $li.filter('.selected').text()
              })
            }
          }
          break
        case 37: // key: Arrow left
        case 39: // key: Arrow right
        case 9: // key: Tab
          ERD.store().commit({
            type: 'columnDataTypeHintVisibleAll',
            isDataTypeHint: false
          })
          this.onKeyArrowMove(e)
          break
      }
    },
    // 데이터변경
    columnChangeDataType (e, tableId, columnId, dataType) {
      ERD.store().commit({
        type: 'columnChangeDataType',
        tableId: tableId,
        columnId: columnId,
        dataType: dataType
      })
      e.target.parentNode.parentNode.childNodes[0].focus()
    },
    // 컬럼 포커스 이동 이벤트
    onEnterMove (e, current, tableId, columnId) {
      if (!e.altKey) {
        switch (current) {
          case 'tableName':
            e.target.parentNode.childNodes[1].focus()
            break
          case 'tableComment':
            const node = e.target.parentNode.parentNode.querySelector('.erd_column')
            if (node != null) {
              node.querySelector('input').focus()
            } else {
              ERD.store().commit({
                type: 'columnAdd',
                id: tableId
              })
            }
            break
          case 'columnName':
            if (!e.altKey) {
              e.target.parentNode.querySelectorAll('input')[1].focus()
            }
            break
          case 'columnNotNull':
            e.target.parentNode.querySelectorAll('input')[3].focus()
            break
          case 'columnComment':
            const table = util.getData(ERD.store().state.tables, tableId)
            if (table.columns[table.columns.length - 1].id === columnId) {
              ERD.store().commit({
                type: 'columnAdd',
                id: tableId
              })
            } else {
              e.target.parentNode.nextSibling.querySelectorAll('input')[0].focus()
            }
            break
        }
      }
    },
    // 컬럼 화살표 이동
    onKeyArrowMove (e) {
      const $div = $(e.target).parents('.erd_table').find('.erd_column')
      const $input = $(e.target).parents('.erd_column').find('input')
      const rowIndex = $input.index(e.target)
      const index = $div.filter('.selected').index()
      const len = $div.length
      switch (e.keyCode) {
        case 38: // key: Arrow up
          e.preventDefault()
          if (index === -1) {
            $div.eq(len - 1).find('input').eq(rowIndex).focus()
          } else {
            $div.eq(index - 1).find('input').eq(rowIndex).focus()
          }
          break
        case 40: // key: Arrow down
          e.preventDefault()
          if (index === -1) {
            $div.eq(0).find('input').eq(rowIndex).focus()
          } else {
            $div.eq(index + 1 === len ? 0 : index + 1).find('input').eq(rowIndex).focus()
          }
          break
        case 37: // key: Arrow left
          e.preventDefault()
          if (rowIndex === -1) {
            $div.eq(index).find('input').eq(2).focus()
          } else {
            $div.eq(index).find('input').eq(rowIndex - 1).focus()
          }
          break
        case 39: // key: Arrow right
          e.preventDefault()
          if (rowIndex === -1) {
            $div.eq(index).find('input').eq(0).focus()
          } else {
            $div.eq(index).find('input').eq(rowIndex + 1 === 4 ? 0 : rowIndex + 1).focus()
          }
          break
      }
    },
    // 마우스 hover addClass
    dataTypeHintAddClass (e) {
      $(e.target).parent('ul').find('li').removeClass('selected')
      $(e.target).addClass('selected')
    },
    // draggableEnd event
    draggableEnd (e) {
      ERD.store().commit({
        type: 'tableHeightReset'
      })
      ERD.store().commit({
        type: 'lineValidColumn',
        id: e.item.getAttribute('column_id')
      })
    },
    // 테이블 그리드 동기화
    onChangeTableGrid (id) {
      storeTable.commit({
        type: 'active',
        id: id
      })
    },
    // 데이터 타입 힌트 애니메이션
    onBeforeEnter (el) {
      el.style.opacity = 0
      el.style.height = 0
    },
    onEnter (el, done) {
      const delay = el.dataset.index * 100
      setTimeout(() => {
        Velocity(
          el,
          { opacity: 1, height: '13.64px' },
          { complete: done }
        )
      }, delay)
    },
    onLeave (el, done) {
      const delay = el.dataset.index * 100
      setTimeout(() => {
        Velocity(
          el,
          { opacity: 0, height: 0 },
          { complete: done }
        )
      }, delay)
    }
  },
  mounted () {
    // 이벤트 핸들러에 컴포넌트 등록
    ERD.core.event.components.CanvasMain.push(this)
  }
}
</script>

<style lang="scss" scoped>
  $table_background: #191919;
  $table_selected: #14496d;
  $column_selected: #00a9ff;
  /* column key color */
  $key_pk: #B4B400;
  $key_fk: #dda8b1;
  $key_pfk: #60b9c4;

  .main_canvas {
    width: 5000px;
    height: 5000px;
    background-color: #282828;

    input:focus {
      border-bottom: solid $column_selected 1px;
    }

    .svg_drag {
      position: absolute;
      z-index: 2147483646;
    }

    .erd_table {
      position: absolute;
      box-sizing: border-box;
      background-color: $table_background;
      opacity: 0.9;
      padding: 10px;
      z-index: 1;

      .erd_table_top {
        height: 33px;

        button {
          width: 17px;
          height: 17px;
          font-size: .70em;
          float: right;
          margin-left: 5px;
          border: none;
          outline: none;
          cursor: pointer;
          border-radius: 50%;

          &:first-child {
            color: #9B0005;
            background-color: #9B0005;
          }
          &:last-child {
            color: #009B2E;
            background-color: #009B2E;
          }

          &:hover {
            color: white;
          }
        }
      }

      .erd_table_header {
        box-sizing: border-box;
        margin-bottom: 15px;

        input {
          width: 47%;
          height: 100%;
          font-size: 20px;
          margin-right: 10px;
        }
      }

      .erd_column {
        height: 25px;
        overflow: hidden;
        box-sizing: border-box;
        display: inline-flex;
        vertical-align: middle;
        align-items: center;

        input, div {
          width: 100px;
          float: left;
          margin-right: 10px;
          font-size: 14px;
        }

        .erd_column_not_null {
          width: 45px;
          cursor: pointer;
        }

        button {
          padding: 0;
          width: 25px;
          height: 25px;
          font-size: .70em;
          color: #b9b9b9;
          border: none;
          outline: none;
          background-color: $table_background;
          cursor: pointer;

          &:hover {
            color: white;
            font-size: .875em;
          }
        }

        /* 데이터 타입 힌트 */
        .erd_data_type_list {
          width: 100px;
          position: absolute;
          color: #a2a2a2;
          background-color: #191919;
          opacity: 0.9;
          margin-top: 25px;

          li {
            cursor: pointer;

            &.selected {
              color: white;
              background-color: #383d41;
            }
          }
        }

        /* column key */
        .erd_column_key {
          width: 16px;
          color: $table_background;
        }

        .pk {
          color: $key_pk;
        }

        .fk {
          color: $key_fk;
        }

        .pfk {
          color: $key_pfk;
        }

        /* 컬럼 선택시 */
        &.selected {
          border-left: solid $column_selected 3px;
        }

        /* 컬럼 관계 */
        &.relation_active {
          border: solid #ffc107 1px;
        }
      }

      /* 테이블 선택시 */
      &.selected {
        border: solid $table_selected 1px;
        box-shadow: 0 1px 6px $table_selected;
      }
    }
  }
</style>
