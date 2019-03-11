import JSLog from '../JSLog'
import storeERD from '@/store/editor/erd'
import model from '@/store/editor/model'
import domToImage from 'dom-to-image'

/**
 * 파일 클래스
 */
class File {
  constructor () {
    JSLog('module loaded', 'File')

    this.core = null
    this.setImport()
    this.a = document.createElement('a')
  }

  // 종속성 초기화
  init (core) {
    JSLog('module dependency init', 'File')
    this.core = core
  }

  // import ready
  setImport () {
    this.importJSONTag = document.createElement('input')
    this.importJSONTag.setAttribute('type', 'file')
    this.importJSONTag.setAttribute('accept', '.verd')
    this.importJSONTag.addEventListener('change', e => {
      const f = e.target.files[0]
      if (/\.(verd)$/i.test(f.name)) {
        const reader = new FileReader()
        reader.readAsText(f)
        reader.onload = () => {
          this.loaded('verd', reader.result, true)
          this.importJSONTag.value = ''
        }
      } else {
        alert('Just upload the verd file')
      }
    })
    this.importSQLTag = document.createElement('input')
    this.importSQLTag.setAttribute('type', 'file')
    this.importSQLTag.setAttribute('accept', '.sql')
    this.importSQLTag.addEventListener('change', e => {
      const f = e.target.files[0]
      if (/\.(sql)$/i.test(f.name)) {
        const reader = new FileReader()
        reader.readAsText(f)
        reader.onload = () => {
          this.loaded('sql', reader.result, true)
          this.importSQLTag.value = ''
        }
      } else {
        alert('Just upload the sql file')
      }
    })
  }

  // file import click event
  click (type) {
    switch (type) {
      case 'verd':
        this.importJSONTag.click()
        break
      case 'sql':
        this.importSQLTag.click()
        break
    }
  }

  // loaded
  loaded (type, data, isAdd) {
    switch (type) {
      case 'verd':
        try {
          const json = JSON.parse(data)
          const tabs = []
          for (let tab of json.tabs) {
            const newTab = {
              id: tab.id,
              name: tab.name,
              active: tab.active,
              store: storeERD(),
              ui: {
                isReadName: true
              }
            }
            newTab.store.commit({
              type: 'importData',
              state: tab.store
            })
            if (isAdd) {
              model.commit({
                type: 'modelAdd',
                isInit: true,
                name: newTab.name,
                store: newTab.store
              })
            } else {
              tabs.push(newTab)
            }
          }
          if (!isAdd) {
            model.commit({
              type: 'importData',
              state: {
                tabs: tabs
              }
            })
          }
        } catch (e) {
          alert('verd parsing error')
        }
        break
    }
  }

  // export
  exportData (type) {
    const fileName = `${this.getFileName()}.${type}`
    switch (type) {
      case 'verd':
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
        domToImage.toBlob(document.querySelector('.canvas')).then(blob => {
          this.execute(blob, fileName)
        })
        break
    }
  }

  // download
  execute (blob, fileName) {
    if (window.chrome.fileSystem) {
      window.chrome.fileSystem.chooseEntry({ type: 'saveFile', suggestedName: fileName }, writableEntry => {
        writableEntry.createWriter(writer => {
          writer.write(blob)
        }, () => {
          alert('save error')
        })
      })
    } else {
      this.a.href = window.URL.createObjectURL(blob)
      this.a.download = fileName
      this.a.click()
    }
  }

  // file Name
  getFileName () {
    const database = this.core.erd.active()
    return `verd-${database.name}-${this.formatDate('yyyyMMdd_hhmmss', new Date())}`
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

  // 현재 텝 복사 생성
  clone () {
    const tab = this.core.erd.active()
    const json = JSON.stringify(this.core.erd.store().state)
    const state = JSON.parse(json)
    const newTab = {
      name: tab.name,
      store: storeERD()
    }
    newTab.store.commit({
      type: 'importData',
      state: state
    })
    model.commit({
      type: 'modelAdd',
      isInit: true,
      name: newTab.name,
      store: newTab.store
    })
  }

  // 객체 정리
  destroy () {}
}

export default new File()
