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
    return stringBuffer.join('\n')
  }
}

export default new Oracle()
