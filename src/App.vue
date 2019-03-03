<template lang="pug">
  v-app#app
    sidebar-navigation(v-if="isSidebar")
    header-toolbar(v-if="isHeader")
    router-view
</template>

<script>
import HeaderToolbar from '@/components/HeaderToolbar'
import SidebarNavigation from '@/components/SidebarNavigation'
import ContentCard from '@/components/ContentCard'

export default {
  name: 'App',
  components: {
    HeaderToolbar,
    SidebarNavigation,
    ContentCard
  },
  data () {
    return {
      isSidebar: true,
      isHeader: true
    }
  },
  created () {
    // 레이아웃 활성 이벤트
    this.$event.$on('App_layout', data => {
      this.isSidebar = data.isLayout
      this.isHeader = data.isLayout
    })
  }
}
</script>

<style lang="scss">
</style>
