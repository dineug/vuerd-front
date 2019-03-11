import JSLog from '../JSLog'

const DB_NAME = 'verd'
const DB_VERSION = 1
const DB_STORE_NAME = 'workspace'
const MODE = {
  RW: 'readwrite',
  R: 'readonly'
}

/**
 * indexDB
 */
class IndexedDB {
  constructor () {
    JSLog('module loaded', 'IndexedDB')
    this.core = null
    this.request = null
    this.db = null
    this.openDB()
  }

  init (core) {
    JSLog('module dependency init', 'IndexedDB')
    this.core = core
  }

  openDB () {
    this.request = indexedDB.open(DB_NAME, DB_VERSION)
    this.request.onerror = e => {
      alert('IndexedDB onerror')
    }
    this.request.onsuccess = e => {
      JSLog('IndexedDB onsuccess')
      this.db = this.request.result
    }
    this.request.onupgradeneeded = e => {
      JSLog('IndexedDB onupgradeneeded')
      e.currentTarget.result.createObjectStore(DB_STORE_NAME, {
        keyPath: 'id', autoIncrement: true
      })
    }
  }

  getObjectStore (storeName, mode) {
    const tx = this.db.transaction(storeName, mode)
    return tx.objectStore(storeName)
  }

  // 추가
  add () {
    const store = this.getObjectStore(DB_STORE_NAME, MODE.RW)
    const req = store.add({
      name: this.core.file.getFileName(),
      json: this.core.file.toJSON()
    })
    req.onsuccess = e => {
      JSLog('IndexedDB store onsuccess')
    }
    req.onerror = e => {
      alert('IndexedDB store onerror')
    }
  }

  // 리스트
  list (callback) {
    const store = this.getObjectStore(DB_STORE_NAME, MODE.R)
    const req = store.openCursor()
    req.onsuccess = e => {
      const cursor = e.target.result
      if (cursor) {
        const req = store.get(cursor.key)
        req.onsuccess = e => {
          callback(e.target.result)
        }
        cursor.continue()
      }
    }
  }

  // 객체 정리
  destroy () {}
}

export default new IndexedDB()
