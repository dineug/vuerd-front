import JSLog from '../JSLog'
import model from '@/store/editor/model'
import mysql from './sql/MySQL'
import oracle from './sql/Oracle'

/**
 * SQL 클래스
 */
class SQL {
  constructor () {
    JSLog('module loaded', 'SQL')
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
    }
  }
}

export default new SQL()
