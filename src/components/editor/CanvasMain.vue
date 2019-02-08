<template lang="pug">
  transition-group#main_canvas(name="slide-fade" tag="div")
    // 테이블
    .erd_table(:class="{ selected: table.ui.selected}" v-for="table in tables" :key="table.id" @mousedown="tableSelected(table.id)" :table_id="table.id"
    :style="`width: ${TABLE_WIDTH}px; top: ${table.ui.top}px; left: ${table.ui.left}px; z-index: ${table.ui.zIndex};`")

      // 테이블 해더
      .erd_table_top
      .erd_table_header
        input(type="text" placeholder="table" v-model="table.name")
        input(type="text" placeholder="comment" v-model="table.comment")
        button(class="btn btn-outline-primary" @click="columnAdd(table.id)")
          font-awesome-icon(icon="plus")
        button(class="btn btn-outline-danger" @click="tableDelete(table.id)")
          font-awesome-icon(icon="times")

      draggable(v-model="table.columns" :options="{group:'table'}" @end="draggableEnd")
        transition-group(name="slide-fade" tag="div")
          // 컬럼
          .erd_column(v-for="column in table.columns" :key="column.id" :class="{ selected: column.ui.selected, relation_active: column.ui.isHover}" @mousedown="columnSelected(table.id, column.id)" :column_id="column.id")

            // 컬럼 key
            .erd_column_key(:class="{ pk: column.ui.pk, fk: column.ui.fk, pfk: column.ui.pfk }")
              font-awesome-icon(icon="key")

            // 컬럼 이름
            input(type="text" placeholder="column" v-model="column.name")

            // 컬럼 데이터타입
            div
              input.erd_data_type(type="text" placeholder="dataType" v-model="column.dataType" @keyup="dataTypeHintVisible($event, table.id, column.id, true)")
              ul.erd_data_type_list(v-if="column.ui.isDataTypeHint")
                li(v-for="dataType in column.ui.dataTypes" @click="columnChangeDataType($event, table.id, column.id, dataType.name)" @mouseover="dataTypeHintAddClass") {{ dataType.name }}

            // 컬럼 not-null
            input.erd_column_not_null(type="text" readonly value="N-N" @click="columnChangeNull(table.id, column.id)" v-if="column.options.notNull")
            input.erd_column_not_null(type="text" readonly value="NULL" @click="columnChangeNull(table.id, column.id)" v-else)

            // 컬럼 comment
            input(type="text" placeholder="comment" v-model="column.comment")

            // 컬럼 삭제 버튼
            button(class="btn" @click="columnDelete(table.id, column.id)")
              font-awesome-icon(icon="times")
</template>

<script>
import $ from 'jquery'
import 'jquery-ui-bundle'
import storeERD from '@/store/editor/erd'
import draggable from 'vuedraggable'
import * as util from '@/js/editor/util'

export default {
  name: 'CanvasMain',
  components: {
    draggable
  },
  data () {
    return {
      tables: storeERD.state.tables,
      TABLE_WIDTH: storeERD.state.TABLE_WIDTH,
      onlyTableSelected: true
    }
  },
  methods: {
    // 컬럼 추가
    columnAdd (id) {
      storeERD.commit({
        type: 'columnAdd',
        id: id
      })
    },
    // 컬럼 삭제
    columnDelete (tableId, columnId) {
      storeERD.commit({
        type: 'columnDelete',
        tableId: tableId,
        columnId: columnId
      })
    },
    // NULL 조건 변경
    columnChangeNull (tableId, columnId) {
      storeERD.commit({
        type: 'columnChangeNull',
        tableId: tableId,
        columnId: columnId
      })
    },
    // 테이블 삭제
    tableDelete (id) {
      storeERD.commit({
        type: 'tableDelete',
        id: id
      })
    },
    // 테이블 선택
    tableSelected (id) {
      storeERD.commit({
        type: 'tableSelected',
        id: id,
        onlyTableSelected: this.onlyTableSelected
      })
      this.onlyTableSelected = true
    },
    // 컬럼 선택
    columnSelected (tableId, columnId) {
      storeERD.commit({
        type: 'columnSelected',
        tableId: tableId,
        columnId: columnId
      })
      this.onlyTableSelected = false
    },
    // 데이터타입 힌트 show/hide
    dataTypeHintVisible (e, tableId, columnId, isDataTypeHint) {
      storeERD.commit({
        type: 'dataTypeHintVisible',
        tableId: tableId,
        columnId: columnId,
        isDataTypeHint: isDataTypeHint
      })
      // 힌트 포커스 이동
      let $li = $(e.target).parent('div').find('li')
      let index = $li.filter('.selected').index()
      let len = $li.length
      // key: Arrow up
      if (e.keyCode === 38) {
        if (index === -1) {
          $li.eq(len - 1).addClass('selected')
        } else {
          $li.eq(index).removeClass('selected')
          $li.eq(index - 1).addClass('selected')
        }
        // key: Arrow down
      } else if (e.keyCode === 40) {
        if (index === -1) {
          $li.eq(0).addClass('selected')
        } else {
          $li.eq(index).removeClass('selected')
          $li.eq(index + 1 === len ? 0 : index + 1).addClass('selected')
        }
        // key: Enter
      } else if (e.keyCode === 13) {
        if (index !== -1) {
          storeERD.commit({
            type: 'columnChangeDataType',
            tableId: tableId,
            columnId: columnId,
            dataType: $li.filter('.selected').text()
          })
        }
        // key: Tab
      } else if (e.keyCode === 9) {
        storeERD.commit({
          type: 'dataTypeHintVisibleAll',
          isDataTypeHint: false
        })
      } else {
        // 데이터타입 검색 정렬
        if (isDataTypeHint) {
          storeERD.commit({
            type: 'changeDataTypeHint',
            tableId: tableId,
            columnId: columnId,
            key: e.target.value
          })
        }
      }
    },
    // 데이터변경
    columnChangeDataType (e, tableId, columnId, dataType) {
      storeERD.commit({
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
      storeERD.commit({
        type: 'tableHeightReset'
      })
      storeERD.commit({
        type: 'lineValidColumn',
        id: $(e.item).attr('column_id')
      })
    }
  },
  updated () {
    // table 이동 이벤트
    $('.erd_table').draggable({
      // handle: '.erd_table_top',
      drag (e, ui) {
        storeERD.commit({
          type: 'tableTracker',
          id: $(this).attr('table_id'),
          top: ui.offset.top,
          left: ui.offset.left
        })
      }
    })
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

  #main_canvas {
    width: 5000px;
    height: 5000px;

    .erd_table {
      position: absolute;
      box-sizing: border-box;
      background-color: $table_background;
      opacity: 0.9;
      padding: 10px;
      z-index: 1;
      cursor: move;

      .erd_table_top {
        height: 15px;
        /*cursor: move;*/
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
          border-radius: 50px;
          color: #dc3545;
          background-color: $table_background;
          border-color: $table_background;
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

  /* table,column 추가,삭제 animation */
  .slide-fade-enter-active {
    transition: all .3s ease;
  }

  .slide-fade-leave-active {
    transition: all .4s ease-out;
  }

  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateX(10px);
    opacity: 0;
  }
</style>
