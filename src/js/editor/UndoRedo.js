import JSLog from '../JSLog'

/**
 * undo, redo
 */
class UndoRedo {
  constructor () {
    JSLog('module loaded', 'UndoRedo')
  }

  // 종속성 초기화
  init (core) {
    JSLog('module dependency init', 'UndoRedo')
    this.core = core
  }
}

export default new UndoRedo()
