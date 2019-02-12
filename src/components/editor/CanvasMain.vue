<template lang="pug">
  .main_canvas(name="slide-fade" tag="div")
    // mouse drag
    svg#svg_drag(v-if="svg.isDarg"
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
      .erd_table_header
        input(v-model="table.name" v-focus
        type="text" placeholder="table")

        input(v-model="table.comment"
        type="text" placeholder="comment")

        button(class="btn btn-outline-primary" title="Alt + Enter"
        @click="columnAdd(table.id)")
          font-awesome-icon(icon="plus")

        button(class="btn btn-outline-danger" title="Delete"
        @click="tableDelete(table.id)")
          font-awesome-icon(icon="times")

      draggable(v-model="table.columns" :options="{group:'table'}"
      @end="draggableEnd")

        // 컬럼
        .erd_column(v-for="column in table.columns" :key="column.id" :column_id="column.id"
        :class="{ selected: column.ui.selected, relation_active: column.ui.isHover}"
        :style="`height: ${COLUMN_HEIGHT}px;`"
        @mousedown="columnSelected(table.id, column.id)")

          // 컬럼 key
          .erd_column_key(:class="{ pk: column.ui.pk, fk: column.ui.fk, pfk: column.ui.pfk }")
            font-awesome-icon(icon="key")

          // 컬럼 이름
          input(v-model="column.name" v-focus
          type="text" placeholder="column")

          // 컬럼 데이터타입
          div
            input.erd_data_type(v-model="column.dataType"
            type="text" placeholder="dataType"
            @keyup="dataTypeHintVisible($event, table.id, column.id, true)"
            @keydown="dataTypeHintFocus($event, table.id, column.id)")

            ul.erd_data_type_list(v-if="column.ui.isDataTypeHint")
              li(v-for="dataType in dataTypes"
              @click="columnChangeDataType($event, table.id, column.id, dataType.name)"
              @mouseover="dataTypeHintAddClass") {{ dataType.name }}

          // 컬럼 not-null
          input.erd_column_not_null(v-if="column.options.notNull"
          type="text" readonly value="N-N"
          @click="columnChangeNull(table.id, column.id)")
          input.erd_column_not_null(v-else
          type="text" readonly value="NULL"
          @click="columnChangeNull(table.id, column.id)")

          // 컬럼 comment
          input(v-model="column.comment"
          type="text" placeholder="comment")

          // 컬럼 삭제 버튼
          button(@click="columnDelete(table.id, column.id)")
            font-awesome-icon(icon="times")
</template>

<script>
import $ from 'jquery'
import ERD from '@/js/editor/ERD'
import draggable from 'vuedraggable'

export default {
  name: 'CanvasMain',
  components: {
    draggable
  },
  directives: {
    // focus 정의
    focus: {
      inserted (el) {
        el.focus()
      }
    }
  },
  data () {
    return {
      onlyTableSelected: true,
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
      ERD.store().commit({
        type: 'tableSelected',
        id: id,
        ctrlKey: e.ctrlKey,
        onlyTableSelected: this.onlyTableSelected
      })
      this.onlyTableSelected = true
    },
    // 컬럼 선택
    columnSelected (tableId, columnId) {
      ERD.store().commit({
        type: 'columnSelected',
        tableId: tableId,
        columnId: columnId
      })
      this.onlyTableSelected = false
      ERD.core.event.isSelectedColumn = true
    },
    // 데이터타입 힌트 show/hide
    dataTypeHintVisible (e, tableId, columnId, isDataTypeHint) {
      ERD.store().commit({
        type: 'columnDataTypeHintVisible',
        tableId: tableId,
        columnId: columnId,
        isDataTypeHint: isDataTypeHint
      })

      if (e.keyCode !== 38 &&
        e.keyCode !== 40 &&
        e.keyCode !== 13 &&
        e.keyCode !== 9) {
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
          if (index === -1) {
            $li.eq(0).addClass('selected')
          } else {
            $li.eq(index).removeClass('selected')
            $li.eq(index + 1 === len ? 0 : index + 1).addClass('selected')
          }
          break
        case 13: // key: Enter
          if (index !== -1) {
            ERD.store().commit({
              type: 'columnChangeDataType',
              tableId: tableId,
              columnId: columnId,
              dataType: $li.filter('.selected').text()
            })
          }
          break
        case 9: // key: Tab
          ERD.store().commit({
            type: 'columnDataTypeHintVisibleAll',
            isDataTypeHint: false
          })
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
      $(e.target).parent().parent('div').find('.erd_data_type').focus()
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
    }
  },
  mounted () {
    // 이벤트 핸들러에 컴포넌트 등록
    ERD.core.event.components.CanvasMain = this
  }
}
</script>

<style lang="scss" scoped>
  $table_background: #191919;
  $table_selected: #14496d;
  /* column key color */
  $key_pk: #B4B400;
  $key_fk: #dda8b1;
  $key_pfk: #60b9c4;

  .main_canvas {
    width: 5000px;
    height: 5000px;
    background-color: #282828;

    #svg_drag {
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
        height: 15px;
      }

      .erd_table_header {
        box-sizing: border-box;
        margin-bottom: 15px;

        button {
          margin-right: 5px;
        }

        input {
          width: 41%;
          height: 100%;
          font-size: 20px;
          margin-right: 10px;
        }
      }

      .erd_column {
        height: 25px;
        overflow: hidden;

        input, div {
          float: left;
          margin-right: 10px;
          margin-bottom: 2px;
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
          color: #672627;
          border: none;
          outline: none;
          background-color: $table_background;
          cursor: pointer;

          &:hover {
            color: #dc3545;
          }
        }

        /* 데이터 타입 힌트 */
        .erd_data_type_list {
          width: 168px;
          position: absolute;
          color: #a2a2a2;
          background-color: #191919;
          opacity: 0.9;
          margin-top: 20px;

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
          border: solid #383d41 1px;
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
