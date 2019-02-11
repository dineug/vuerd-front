import JSLog from '../JSLog'
import event from './Event'
import file from './File'
import model from '@/store/editor/model'

/**
 * core 클래스
 */
class ERD {
  constructor () {
    JSLog('module loaded', 'ERD')

    // 모듈 객체
    this.core = {
      erd: this,
      event: event,
      file: file
    }

    this.setInit(this.core)
  }

  // 종속성 초기화
  setInit (core) {
    JSLog('module dependency init', 'ERD')
    Object.keys(core).forEach(function (v) {
      if (typeof core[v].init === 'function') core[v].init(core)
    })
  }

  // 할성화 된 탭 모델 데이터
  store () {
    for (let tab of model.state.tabs) {
      if (tab.active) {
        return tab.store
      }
    }
  }
}

export default new ERD()
