import JSLog from '../../JSLog'
import * as util from '../util'

/**
 * MySQL
 */
class MySQL {
  constructor () {
    JSLog('module loaded', 'MySQL')
    this.sql = null
    this.fkNames = []
  }

  init (sql) {
    this.sql = sql
  }

  ddl (database) {
    this.fkNames = []
    const stringBuffer = []
    const tables = database.store.state.tables
    const lines = database.store.state.lines

    stringBuffer.push(`DROP SCHEMA IF EXISTS ${database.name} ;`)
    stringBuffer.push('')
    stringBuffer.push(`CREATE SCHEMA IF NOT EXISTS ${database.name} DEFAULT CHARACTER SET utf8 ;`)
    stringBuffer.push(`USE ${database.name} ;`)
    stringBuffer.push('')

    tables.forEach(table => {
      this.formatTable({
        name: database.name,
        table: table,
        buffer: stringBuffer
      })
      stringBuffer.push('')
    })
    lines.forEach(line => {
      this.formatRelation({
        name: database.name,
        tables: tables,
        line: line,
        buffer: stringBuffer
      })
      stringBuffer.push('')
    })

    return stringBuffer.join('\n')
  }

  // 테이블 formatter
  formatTable ({ name, table, buffer }) {
    buffer.push(`CREATE TABLE IF NOT EXISTS ${name}.${table.name} (`)
    const isPK = util.isColumnOption('primaryKey', table.columns)
    const isUQ = util.isColumnOption('unique', table.columns)
    const spaceSize = this.sql.formatSize(table.columns)

    table.columns.forEach((column, i) => {
      if (isPK || isUQ) {
        this.formatColumn({
          column: column,
          isComma: true,
          spaceSize: spaceSize,
          buffer: buffer
        })
      } else {
        this.formatColumn({
          column: column,
          isComma: table.columns.length !== i + 1,
          spaceSize: spaceSize,
          buffer: buffer
        })
      }
    })
    // PK 및 UQ 추가
    if (isPK && isUQ) {
      const pkColumns = util.getColumnOptions('primaryKey', table.columns)
      buffer.push(`\tPRIMARY KEY (${this.sql.formatNames(pkColumns)}),`)
      const uqColumns = util.getColumnOptions('unique', table.columns)
      uqColumns.forEach((column, i) => {
        buffer.push(`\tUNIQUE INDEX ${column.name}_UNIQUE (${column.name} ASC)${uqColumns.length !== i + 1 ? ',' : ''}`)
      })
    } else if (isPK) {
      const columns = util.getColumnOptions('primaryKey', table.columns)
      buffer.push(`\tPRIMARY KEY (${this.sql.formatNames(columns)})`)
    } else if (isUQ) {
      const columns = util.getColumnOptions('unique', table.columns)
      columns.forEach((column, i) => {
        buffer.push(`\tUNIQUE INDEX ${column.name}_UNIQUE (${column.name} ASC)${columns.length !== i + 1 ? ',' : ''}`)
      })
    }
    // 코멘트 처리
    if (table.comment.trim() === '') {
      buffer.push(`);`)
    } else {
      buffer.push(`) COMMENT '${table.comment}';`)
    }
  }

  // 컬럼 formatter
  formatColumn ({ column, isComma, spaceSize, buffer }) {
    const stringBuffer = []
    stringBuffer.push(`\t${column.name}` + this.sql.formatSpace(spaceSize.nameMax - column.name.length))
    stringBuffer.push(`${column.dataType}` + this.sql.formatSpace(spaceSize.dataTypeMax - column.dataType.length))
    // 옵션 UNSIGNED
    if (column.options.unsigned) {
      stringBuffer.push(`UNSIGNED`)
    }
    stringBuffer.push(`${column.options.notNull ? 'NOT NULL' : 'NULL    '}`)
    // 컬럼 DEFAULT
    if (column.default.trim() !== '') {
      if (isNaN(column.default)) {
        if (column.default === 'CURRENT_TIMESTAMP') {
          stringBuffer.push(`DEFAULT CURRENT_TIMESTAMP`)
        } else {
          stringBuffer.push(`DEFAULT '${column.default}'`)
        }
      } else {
        stringBuffer.push(`DEFAULT ${column.default}`)
      }
    }
    // 옵션 AUTO_INCREMENT
    if (column.options.autoIncrement) {
      stringBuffer.push(`AUTO_INCREMENT`)
    }
    // 코멘트 처리
    if (column.comment.trim() !== '') {
      stringBuffer.push(`COMMENT '${column.comment}'`)
    }
    buffer.push(stringBuffer.join(' ') + `${isComma ? ',' : ''}`)
  }

  // 관계 formatter
  formatRelation ({ name, tables, line, buffer }) {
    const startTable = util.getData(tables, line.points[0].id)
    const endTable = util.getData(tables, line.points[1].id)
    buffer.push(`ALTER TABLE ${name}.${endTable.name}`)

    // FK 중복 처리
    let fkName = `FK_${startTable.name}_TO_${endTable.name}`
    fkName = util.autoName(this.fkNames, fkName)
    this.fkNames.push({ name: fkName })

    buffer.push(`\tADD CONSTRAINT ${fkName}`)

    // key 컬럼 정제
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

    buffer.push(`\t\tFOREIGN KEY (${this.sql.formatNames(columns.end)})`)
    buffer.push(`\t\tREFERENCES ${name}.${startTable.name} (${this.sql.formatNames(columns.start)}),`)

    buffer.push(`\tADD INDEX ${fkName} (${this.sql.formatNames(columns.end)});`)
  }
}

export default new MySQL()
