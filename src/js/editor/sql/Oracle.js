import JSLog from '../../JSLog'
import * as util from '../util'

/**
 * Oracle
 */
class Oracle {
  constructor () {
    JSLog('module loaded', 'Oracle')
    this.sql = null
    this.fkNames = []
    this.aiNames = []
    this.trgNames = []
  }

  init (sql) {
    this.sql = sql
  }

  ddl (database) {
    this.fkNames = []
    this.aiNames = []
    this.trgNames = []
    const stringBuffer = []
    const tables = database.store.state.tables
    const lines = database.store.state.lines

    tables.forEach(table => {
      this.formatTable({
        name: database.name,
        table: table,
        buffer: stringBuffer
      })
      stringBuffer.push('')
      // 시퀀스 추가
      table.columns.forEach(column => {
        if (column.options.autoIncrement) {
          let aiName = `${table.name}_SEQ`
          aiName = util.autoName(this.aiNames, aiName)
          this.aiNames.push({ name: aiName })

          stringBuffer.push(`CREATE SEQUENCE ${aiName}`)
          stringBuffer.push(`START WITH 1 INCREMENT BY 1;`)
          stringBuffer.push('')

          let trgName = `${table.name}_SEQ_TRG`
          trgName = util.autoName(this.aiNames, trgName)
          this.trgNames.push({ name: trgName })
          stringBuffer.push(`CREATE OR REPLACE TRIGGER ${trgName}`)
          stringBuffer.push(`BEFORE INSERT ON ${table.name}`)
          stringBuffer.push(`REFERENCING NEW AS NEW FOR EACH ROW`)
          stringBuffer.push(`BEGIN`)
          stringBuffer.push(`\tSELECT ${aiName}.NEXTVAL`)
          stringBuffer.push(`\tINTO: NEW.${column.name}`)
          stringBuffer.push(`\tFROM DUAL;`)
          stringBuffer.push(`END;`)
          stringBuffer.push('')
        }
      })
      // 코멘트 추가
      this.formatComment({
        name: database.name,
        table: table,
        buffer: stringBuffer
      })
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

  // 테이블
  formatTable ({ name, table, buffer }) {
    buffer.push(`CREATE TABLE ${name}.${table.name} (`)
    const isPK = util.isColumnOption('primaryKey', table.columns)
    const spaceSize = this.sql.formatSize(table.columns)

    table.columns.forEach((column, i) => {
      if (isPK) {
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
    // PK
    if (isPK) {
      const pkColumns = util.getColumnOptions('primaryKey', table.columns)
      buffer.push(`\tCONSTRAINT ${table.name}_PK PRIMARY KEY (${this.sql.formatNames(pkColumns)})`)
    }
    buffer.push(`);`)
  }

  // 컬럼
  formatColumn ({ column, isComma, spaceSize, buffer }) {
    const stringBuffer = []
    stringBuffer.push(`\t${column.name}` + this.sql.formatSpace(spaceSize.nameMax - column.name.length))
    stringBuffer.push(`${column.dataType}` + this.sql.formatSpace(spaceSize.dataTypeMax - column.dataType.length))
    // 옵션 Not NUll
    if (column.options.notNull) {
      stringBuffer.push(`NOT NULL`)
    }
    // 옵션 유니크
    if (column.options.unique) {
      stringBuffer.push(`UNIQUE`)
    }
    // 컬럼 DEFAULT
    if (column.default.trim() !== '') {
      if (isNaN(column.default)) {
        stringBuffer.push(`DEFAULT '${column.default}'`)
      } else {
        stringBuffer.push(`DEFAULT ${column.default}`)
      }
    }
    buffer.push(stringBuffer.join(' ') + `${isComma ? ',' : ''}`)
  }

  // 코멘트
  formatComment ({ name, table, buffer }) {
    if (table.comment.trim() !== '') {
      buffer.push(`COMMENT ON TABLE ${name}.${table.name} IS '${table.comment}';`)
      buffer.push('')
    }
    table.columns.forEach(column => {
      if (column.comment.trim() !== '') {
        buffer.push(`COMMENT ON COLUMN ${name}.${table.name}.${column.name} IS '${column.comment}';`)
        buffer.push('')
      }
    })
  }

  // 관계
  formatRelation ({ name, tables, line, buffer }) {
    const startTable = util.getData(tables, line.points[0].id)
    const endTable = util.getData(tables, line.points[1].id)
    buffer.push(`ALTER TABLE ${name}.${endTable.name}`)

    // FK 중복 처리
    let fkName = `FK_${startTable.name}_TO_${endTable.name}`
    fkName = util.autoName(this.fkNames, fkName)
    this.fkNames.push(fkName)

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
    buffer.push(`\t\tREFERENCES ${name}.${startTable.name} (${this.sql.formatNames(columns.start)});`)
  }
}

export default new Oracle()
