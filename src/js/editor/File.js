import JSLog from '../JSLog'
import storeERD from '@/store/editor/erd'
import model from '@/store/editor/model'
import $ from 'jquery'

/**
 * 파일 클래스
 */
class File {
  constructor () {
    JSLog('module loaded', 'File')

    this.setImport()
  }

  // 종속성 초기화
  init (core) {
    JSLog('module dependency init', 'File')
    this.core = core
  }

  // import ready
  setImport () {
    this.importJSONTag = $('<input type="file">').change(e => {
      const f = e.target.files[0]
      if (/\.(json)$/i.test(f.name)) {
        const reader = new FileReader()
        reader.readAsText(f)
        reader.onload = () => {
          this.load('json', reader.result)
        }
      } else {
        alert('json 파일만 올려주세요')
      }
    })
    this.importSQLTag = $('<input type="file">').change(e => {
      const f = e.target.files[0]
      if (/\.(sql)$/i.test(f.name)) {
        const reader = new FileReader()
        reader.readAsText(f)
        reader.onload = () => {
          this.load('sql', reader.result)
        }
      } else {
        alert('sql 파일만 올려주세요')
      }
    })
  }

  // file import click event
  click (type) {
    switch (type) {
      case 'json':
        this.importJSONTag.click()
        break
      case 'sql':
        this.importSQLTag.click()
        break
    }
  }

  // load
  load (type, data) {
    switch (type) {
      case 'json':
        const json = JSON.parse(data)
        for (let tab of json.tabs) {
          const newTab = {
            id: tab.id,
            name: tab.name,
            active: false,
            store: storeERD()
          }
          newTab.store.commit({
            type: 'importData',
            state: tab.store
          })
          model.commit({
            type: 'modelAdd',
            isImport: true,
            tab: newTab
          })
        }
        break
    }
  }

  // export
  exportData (type) {
    switch (type) {
      case 'json':
        const filename = `vuerd-${model.state.tabs.name}-${new Date().getTime()}.json`
        const json = this.toJSON()
        const blob = new Blob([json], { type: 'application/json' })
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveBlob(blob, filename)
        } else {
          const elem = window.document.createElement('a')
          elem.href = window.URL.createObjectURL(blob)
          elem.download = filename
          document.body.appendChild(elem)
          elem.click()
          document.body.removeChild(elem)
        }
        break
      case 'sql':
        break
    }
  }

  // json 데이터 정제
  toJSON () {
    const models = {
      tabs: []
    }
    for (let tab of model.state.tabs) {
      models.tabs.push({
        id: tab.id,
        name: tab.name,
        active: tab.active,
        store: tab.store.state
      })
    }
    return JSON.stringify(models)
  }
}

export default new File()
