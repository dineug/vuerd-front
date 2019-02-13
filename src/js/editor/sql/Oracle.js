import JSLog from '../../JSLog'

/**
 * Oracle
 */
class Oracle {
  constructor () {
    JSLog('module loaded', 'Oracle')
  }

  ddl (database) {
    const stringBuffer = []
    return stringBuffer.join('Oracle DDL 미구현 \n')
  }
}

export default new Oracle()
