import JSLog from '../JSLog'
import event from './Event'
import file from './File'
import sql from './SQL'
import undoRedo from './UndoRedo'
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
      file: file,
      sql: sql,
      undoRedo: undoRedo
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

  // 활성화 된 탭 state
  active () {
    for (let tab of model.state.tabs) {
      if (tab.active) {
        return tab
      }
    }
  }

  // 객체 제거
  destroy () {
    this.core.event.destroy()
    this.core.file.destroy()
    this.core.sql.destroy()
    this.core.undoRedo.destroy()
    delete this
  }
}

export default new ERD()
