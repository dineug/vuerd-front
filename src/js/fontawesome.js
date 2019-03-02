import Vue from 'vue'
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
  faSignOutAlt,
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
  faSignOutAlt,
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
