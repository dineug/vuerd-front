import JSLog from '../JSLog'
import storeERD from '@/store/editor/erd'
import model from '@/store/editor/model'
import $ from 'jquery'
import domtoimage from 'dom-to-image'

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
    this.importJSONTag = $('<input type="file" accept=".json">').change(e => {
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
    this.importSQLTag = $('<input type="file" accept=".sql">').change(e => {
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
        const models = {
          tabs: []
        }
        for (let tab of json.tabs) {
          const newTab = {
            id: tab.id,
            name: tab.name,
            active: tab.active,
            store: storeERD()
          }
          newTab.store.commit({
            type: 'importData',
            state: tab.store
          })
          models.tabs.push(newTab)
        }
        model.commit({
          type: 'importData',
          state: models
        })
        break
    }
  }

  // export
  exportData (type) {
    let database = null
    for (let tab of model.state.tabs) {
      if (tab.active) {
        database = tab
        break
      }
    }
    const fileName = `vuerd-${database.name}-${this.formatDate('yyyyMMdd_hhmmss', new Date())}.${type}`
    switch (type) {
      case 'json':
        const json = this.toJSON()
        const blobJson = new Blob([json], { type: 'application/json' })
        this.execute(blobJson, fileName)
        break
      case 'sql':
        const sql = this.core.sql.toDDL()
        const blobSQL = new Blob([sql], { type: 'text' })
        this.execute(blobSQL, fileName)
        break
      case 'png':
        domtoimage.toBlob(document.querySelector('#erd')).then(blob => {
          this.execute(blob, fileName)
        })
        break
    }
  }

  // download
  execute (blob, fileName) {
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, fileName)
    } else {
      const elem = window.document.createElement('a')
      elem.href = window.URL.createObjectURL(blob)
      elem.download = fileName
      document.body.appendChild(elem)
      elem.click()
      document.body.removeChild(elem)
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

  // 날짜 포맷 yyyy, MM, dd, hh, mm, ss
  formatDate (format, date) {
    const d = new Date(date)
    let year = d.getFullYear()
    let month = (d.getMonth() + 1)
    let day = d.getDate()
    let hh = d.getHours().toString()
    let mm = d.getMinutes().toString()
    let ss = d.getSeconds().toString()

    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day
    if (hh < 10) hh = '0' + hh
    if (mm < 10) mm = '0' + mm
    if (ss < 10) ss = '0' + ss
    hh = hh === '0' ? '00' : hh
    mm = mm === '0' ? '00' : mm
    ss = ss === '0' ? '00' : ss

    format = format.replace('yyyy', year)
    format = format.replace('MM', month)
    format = format.replace('dd', day)
    format = format.replace('hh', hh)
    format = format.replace('mm', mm)
    format = format.replace('ss', ss)
    return format
  }
}

export default new File()
