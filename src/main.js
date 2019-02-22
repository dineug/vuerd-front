import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import Vuetify from 'vuetify'
// import 'vuetify/dist/vuetify.min.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faKey,
  faEye,
  faPlus,
  faList,
  faUndo,
  faRedo,
  faCopy,
  faBook,
  faTable,
  faTimes,
  faCheck,
  faDatabase,
  faQuestion,
  faFileImage,
  faFileImport,
  faFileExport,
  faFileUpload,
  faStickyNote,
  faFileMedical,
  faFileDownload,
  faCloudUploadAlt,
  faExpandArrowsAlt
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faKey,
  faEye,
  faPlus,
  faList,
  faUndo,
  faRedo,
  faCopy,
  faBook,
  faTable,
  faTimes,
  faCheck,
  faDatabase,
  faQuestion,
  faFileImage,
  faFileImport,
  faFileExport,
  faFileUpload,
  faStickyNote,
  faFileMedical,
  faFileDownload,
  faCloudUploadAlt,
  faExpandArrowsAlt
)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(Vuetify)
Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.$event = new Vue()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
