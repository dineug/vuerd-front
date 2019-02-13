import JSLog from '../JSLog'
import model from '@/store/editor/model'
import * as util from './util'
// import mysql from './sql/MySQL'
// import oracle from './sql/Oracle'

/**
 * SQL 클래스
 */
class SQL {
  constructor () {
    JSLog('module loaded', 'SQL')

    this.fkNames = []
  }

  // 종속성 초기화
  init (core) {
    JSLog('module dependency init', 'SQL')
    this.core = core
  }

  // SQL DDL
  toDDL () {
    let database = null
    for (let tab of model.state.tabs) {
      if (tab.active) {
        database = tab
        break
      }
    }
    return this.ddl(database)
  }

  // DDL SQL 생성
  ddl (database) {
    this.fkNames = []
    const stringBuffer = []
    const DBType = database.store.state.DBType
    database.store.state.tables.forEach(table => {
      this.createTable({
        DBType: DBType,
        name: database.name,
        table: table,
        buffer: stringBuffer
      })
      stringBuffer.push('\n')
    })
    database.store.state.lines.forEach(line => {
      this.alterTable({
        DBType: DBType,
        name: database.name,
        tables: database.store.state.tables,
        line: line,
        buffer: stringBuffer
      })
      stringBuffer.push('\n')
    })

    return stringBuffer.join('\n')
  }

  // 테이블 DDL
  createTable ({ DBType, name, table, buffer }) {
    switch (DBType) {
      case 'MySQL':
        buffer.push(`CREATE TABLE \`${name}\`.\`${table.name}\` (`)
        table.columns.forEach((column, i) => {
          if (util.tableIsPrimaryKey(table.columns)) {
            this.column({
              DBType: DBType,
              column: column,
              isComma: true,
              buffer: buffer
            })
          } else {
            this.column({
              DBType: DBType,
              column: column,
              isComma: table.columns.length !== i + 1,
              buffer: buffer
            })
          }
        })
        // pk 처리
        if (util.tableIsPrimaryKey(table.columns)) {
          const columns = util.getPKColumns(table.id)
          buffer.push(`\tPRIMARY KEY (${this.getListString(columns)})`)
        }
        buffer.push(`) COMMENT '${table.comment}';`)
        break
      case 'Oracle':
        break
    }
  }

  // 컬럼 DDL
  column ({ DBType, column, isComma, buffer }) {
    switch (DBType) {
      case 'MySQL':
        buffer.push(`\t\`${column.name}\` ${column.dataType} ${column.options.notNull ? 'NOT NULL' : 'NULL'} COMMENT '${column.comment}'${isComma ? ',' : ''}`)
        break
      case 'Oracle':
        break
    }
  }

  // 관계 DDL 생성
  alterTable ({ DBType, name, tables, line, buffer }) {
    switch (DBType) {
      case 'MySQL':
        const endTable = util.getData(tables, line.points[1].id)
        const startTable = util.getData(tables, line.points[0].id)
        buffer.push(`ALTER TABLE \`${name}\`.\`${endTable.name}\``)
        let fkName = `FK_${startTable.name}_TO_${endTable.name}`
        fkName = util.autoName(this.fkNames, fkName)
        this.fkNames.push(fkName)
        buffer.push(`\tADD CONSTRAINT \`${fkName}\``)
        const columns = {
          start: [],
          end: []
        }
        line.points[1].columnIds.forEach(id => {
          columns.end.push(util.getData(endTable.columns, id))
        })
        line.points[0].columnIds.forEach(id => {
          columns.start.push(util.getData(startTable.columns, id))
        })

        buffer.push(`\t\tFOREIGN KEY (${this.getListString(columns.end)})`)
        buffer.push(`\t\tREFERENCES \`${name}\`.\`${startTable.name}\` (${this.getListString(columns.start)}),`)

        buffer.push(`\tADD INDEX \`${fkName}\` (${this.getListString(columns.end)});`)
        break
      case 'Oracle':
        break
    }
  }

  // 리스트 name -> name, ...
  getListString (list) {
    let str = ''
    list.forEach((v, i) => {
      str += `\`${v.name}\``
      if (list.length !== i + 1) str += ', '
    })
    return str
  }
}

export default new SQL()
