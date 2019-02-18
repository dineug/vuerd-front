import JSLog from '../JSLog'
import model from '@/store/editor/model'
import mysql from './sql/MySQL'
import oracle from './sql/Oracle'
import mariadb from './sql/MariaDB'
import mssql from './sql/MSSQL'
import postgresql from './sql/PostgreSQL'

/**
 * SQL 클래스
 */
class SQL {
  constructor () {
    JSLog('module loaded', 'SQL')
    mysql.init(this)
    oracle.init(this)
    mariadb.init(this)
    mssql.init(this)
    postgresql.init(this)
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
    switch (database.store.state.DBType) {
      case 'MySQL':
        return mysql.ddl(database)
      case 'Oracle':
        return oracle.ddl(database)
      case 'MariaDB':
        return mariadb.ddl(database)
      case 'MSSQL':
        return mssql.ddl(database)
      case 'PostgreSQL':
        return postgresql.ddl(database)
    }
  }

  // 이름 foramtter
  formatNames (list, backtick, backtick2) {
    let str = ''
    list.forEach((v, i) => {
      if (backtick) {
        if (backtick2) {
          str += `${backtick}${v.name}${backtick2}`
        } else {
          str += `${backtick}${v.name}${backtick}`
        }
      } else {
        str += v.name
      }
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

export default new SQL()
