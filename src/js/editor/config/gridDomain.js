import _ from 'underscore'
import ERD from '@/js/editor/ERD'

export default {
  options: {
    header: {
      height: 50,
      complexColumns: [
        {
          title: 'Domain',
          name: 'domain',
          childNames: ['name', 'dataType', 'default']
        }
      ]
    },
    scrollX: false,
    // scrollY: false,
    bodyHeight: 160,
    rowHeaders: [{
      type: 'checkbox',
      template: function (props) {
        let tmpl = '<div class="Checkbox_checkbox">'
        tmpl += '<label>'
        tmpl += '<input class="Checkbox_input <%=className%>" type="checkbox" name="<%=name%>" '
        tmpl += '<%= disabled ? "disabled" : "" %> '
        tmpl += '<%= checked ? "checked" : "" %> />'
        tmpl += '<div class="Checkbox_indicator"></div>'
        tmpl += '</label>'
        tmpl += '</div>'
        return _.template(tmpl)(props)
      }
    }, 'rowNum']
  },
  columnData: [
    {
      title: 'Name',
      name: 'name',
      onBeforeChange: ev => {
        ERD.store().commit({
          type: 'domainChange',
          rowKey: ev.rowKey,
          domain: {
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
        ERD.store().commit({
          type: 'domainChange',
          rowKey: ev.rowKey,
          domain: {
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
      title: 'Default',
      name: 'default',
      onBeforeChange: ev => {
        ERD.store().commit({
          type: 'domainChange',
          rowKey: ev.rowKey,
          domain: {
            default: ev.value
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
