import * as util from '@/js/editor/util'
import storeTable from '@/store/editor/table'

export default {
  options: {
    header: {
      height: 50,
      complexColumns: [
        {
          title: '',
          name: 'table',
          childNames: ['name', 'dataType', 'primaryKey', 'notNull', 'unique', 'autoIncrement', 'default', 'comment']
        }
      ]
    },
    scrollX: false,
    // scrollY: false,
    bodyHeight: 160,
    rowHeaders: ['rowNum']
  },
  columnData: [
    {
      title: 'Column Name',
      name: 'name',
      onBeforeChange: ev => {
        storeTable.commit({
          type: 'sync',
          rowKey: ev.rowKey,
          column: {
            name: ev.value
          }
        })
      },
      editOptions: {
        type: 'text',
        useViewMode: true
      }
    },
    {
      title: 'DataType',
      name: 'dataType',
      onBeforeChange: ev => {
        storeTable.commit({
          type: 'sync',
          rowKey: ev.rowKey,
          column: {
            dataType: ev.value
          }
        })
      },
      editOptions: {
        type: 'text',
        useViewMode: true
      }
    },
    {
      title: 'PK',
      name: 'primaryKey',
      width: 50,
      onBeforeChange: ev => {
        storeTable.commit({
          type: 'sync',
          rowKey: ev.rowKey,
          isPK: true,
          column: {
            options: {
              primaryKey: ev.value ? ev.value : false
            },
            ui: {
              pk: ev.value ? ev.value : false
            }
          }
        })
      },
      editOptions: {
        type: 'checkbox',
        listItems: [
          { text: util.svgCheck, value: true }
        ],
        useViewMode: true
      }
    },
    {
      title: 'NN',
      name: 'notNull',
      width: 50,
      onBeforeChange: ev => {
        storeTable.commit({
          type: 'sync',
          rowKey: ev.rowKey,
          column: {
            options: {
              notNull: ev.value ? ev.value : false
            }
          }
        })
      },
      editOptions: {
        type: 'checkbox',
        listItems: [
          { text: util.svgCheck, value: true }
        ],
        useViewMode: true
      }
    },
    {
      title: 'UQ',
      name: 'unique',
      width: 50,
      onBeforeChange: ev => {
        storeTable.commit({
          type: 'sync',
          rowKey: ev.rowKey,
          column: {
            options: {
              unique: ev.value ? ev.value : false
            }
          }
        })
      },
      editOptions: {
        type: 'checkbox',
        listItems: [
          { text: util.svgCheck, value: true }
        ],
        useViewMode: true
      }
    },
    {
      title: 'AI',
      name: 'autoIncrement',
      width: 50,
      onBeforeChange: ev => {
        storeTable.commit({
          type: 'sync',
          rowKey: ev.rowKey,
          column: {
            options: {
              autoIncrement: ev.value ? ev.value : false
            }
          }
        })
      },
      editOptions: {
        type: 'checkbox',
        listItems: [
          { text: util.svgCheck, value: true }
        ],
        useViewMode: true
      }
    },
    {
      title: 'Default',
      name: 'default',
      onBeforeChange: ev => {
        storeTable.commit({
          type: 'sync',
          rowKey: ev.rowKey,
          column: {
            default: ev.value
          }
        })
      },
      editOptions: {
        type: 'text',
        useViewMode: true
      }
    },
    {
      title: 'Comment',
      name: 'comment',
      onBeforeChange: ev => {
        storeTable.commit({
          type: 'sync',
          rowKey: ev.rowKey,
          column: {
            comment: ev.value
          }
        })
      },
      editOptions: {
        type: 'text',
        useViewMode: true
      }
    }
  ]
}
