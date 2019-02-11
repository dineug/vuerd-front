import JSLog from '@/js/JSLog'
import Vue from 'vue'
import Vuex from 'vuex'
import * as util from '@/js/editor/util'
import storeERD from '@/store/editor/erd'

JSLog('store loaded', 'model')
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tabs: [
      {
        id: util.guid(),
        name: 'untitled',
        active: true,
        store: storeERD()
      }
    ]
  },
  mutations: {
    // 모델 추가
    modelAdd (state) {
      JSLog('mutations', 'modelAdd')
      const tab = {
        id: util.guid(),
        name: util.autoName(state.tabs, 'untitled'),
        active: false,
        store: storeERD()
      }
      state.tabs.push(tab)
      this.commit({
        type: 'modelActive',
        id: tab.id
      })
    },
    // 모델 변경
    modelActive (state, data) {
      JSLog('mutations', 'modelActive')
      const isTab = util.getData(state.tabs, data.id)
      if (isTab) {
        state.tabs.forEach(tab => {
          if (tab.id === data.id) {
            tab.active = true
          } else {
            tab.active = false
          }
        })
      }
    },
    // 모델 변경 단축키
    modelActiveKeyMap (state, data) {
      JSLog('mutations', 'modelActiveKeyMap')
      let isActive = false
      for (let i = 0; i < state.tabs.length; i++) {
        if (data.index === i + 1) {
          isActive = true
          break
        }
      }
      if (isActive) {
        state.tabs.forEach((tab, i) => {
          if (data.index === i + 1) {
            tab.active = true
          } else {
            tab.active = false
          }
        })
      }
    },
    // 모델 삭제
    modelDelete (state, data) {
      JSLog('mutations', 'modelDelete')
      const tab = util.getData(state.tabs, data.id)
      for (let i in state.tabs) {
        if (data.id === state.tabs[i].id) {
          state.tabs.splice(i, 1)
          if (state.tabs.length === 0) {
            this.commit({ type: 'modelAdd' })
          } else if (tab && tab.active) {
            state.tabs[state.tabs.length - 1].active = true
          }
          break
        }
      }
    }
  }
})
