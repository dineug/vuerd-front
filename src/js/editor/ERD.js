import JSLog from '../JSLog'
import event from './Event'

/**
 * core 클래스
 */
class ERD {
  constructor () {
    JSLog('module loaded', 'ERD')

    // 모듈 객체
    this.core = {
      event: event
    }

    this.setInit(this.core)
  }

  // 종속성 초기화
  setInit (core) {
    JSLog('module dependency init', 'ERD')
    Object.keys(core).forEach(function (v) {
      core[v].init(core)
    })
  }
}

export default new ERD()
