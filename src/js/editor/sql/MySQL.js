import JSLog from '../../JSLog'
import * as util from '../util'

/**
 * MySQL
 */
class MySQL {
  constructor () {
    JSLog('module loaded', 'MySQL')
    this.fkNames = []
  }

  ddl (database) {
    this.fkNames = []
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
    buffer.push(`CREATE TABLE \`${name}\`.\`${table.name}\` (`)
    const isPK = util.isPK(table.columns)
    const spaceSize = this.formatSize(table.columns)

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
    // pk 추가
    if (isPK) {
      const columns = util.getPKs(table.id)
      buffer.push(`\tPRIMARY KEY (${this.formatNames(columns)})`)
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
    stringBuffer.push(`\t\`${column.name}\`` + this.formatSpace(spaceSize.nameMax - column.name.length))
    stringBuffer.push(`${column.dataType}` + this.formatSpace(spaceSize.dataTypeMax - column.dataType.length))
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
    buffer.push(`ALTER TABLE \`${name}\`.\`${endTable.name}\``)

    // FK 중복 처리
    let fkName = `FK_${startTable.name}_TO_${endTable.name}`
    fkName = util.autoName(this.fkNames, fkName)
    this.fkNames.push(fkName)

    buffer.push(`\tADD CONSTRAINT \`${fkName}\``)

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

    buffer.push(`\t\tFOREIGN KEY (${this.formatNames(columns.end)})`)
    buffer.push(`\t\tREFERENCES \`${name}\`.\`${startTable.name}\` (${this.formatNames(columns.start)}),`)

    buffer.push(`\tADD INDEX \`${fkName}\` (${this.formatNames(columns.end)});`)
  }

  // 이름 foramtter
  formatNames (list) {
    let str = ''
    list.forEach((v, i) => {
      str += `\`${v.name}\``
      if (list.length !== i + 1) str += ', '
    })
    return str
  }

  // 컬럼 이름, 데이터 타입 정렬 최대길이
  formatSize (columns) {
    let nameMax = 0
    let dataTypeMax = 0
    columns.forEach(column => {
      if (nameMax < column.name.length) nameMax = column.name.length
      if (dataTypeMax < column.dataType.length) dataTypeMax = column.dataType.length
    })
    return {
      nameMax: nameMax,
      dataTypeMax: dataTypeMax
    }
  }

  // 숫자만큼 공백생성
  formatSpace (size) {
    let space = ''
    for (let i = 0; i < size; i++) {
      space += ' '
    }
    return space
  }
}

export default new MySQL()
