<template lang="pug">
  v-toolbar.header_wrapper
    v-toolbar-side-icon
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
        case 'ERD':
          this.$router.push({ path: '/erd' })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .header_wrapper {

  }
</style>
