<template lang="pug">
  v-toolbar.header_wrapper(dense fixed clipped-left app)
    v-toolbar-side-icon(@click.stop="sidebar")
    v-toolbar-items
      v-btn(flat @click="menuAction('main')") vuerd
    v-toolbar-items
      v-btn(flat @click="menuAction('ERD')") ERD
    v-spacer
    v-toolbar-items
      v-btn(flat) login
</template>

<script>
export default {
  name: 'HeaderToolbar',
  methods: {
    menuAction (type) {
      switch (type) {
        case 'main':
          this.$router.push({ path: '/' })
          break
        case 'ERD':
          this.$router.push({ path: '/erd' })
          break
      }
    },
    sidebar () {
      this.$event.$emit('SidebarNavigation_drawer')
    }
  }
}
</script>

<style lang="scss" scoped>
  .header_wrapper {

  }
</style>
