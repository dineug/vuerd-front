<template lang="pug">
  v-navigation-drawer(fixed clipped v-model="drawer" app)
    v-list(dense)
      v-list-tile(v-for="item in items" :key="item.text" @click="")
        v-list-tile-action
          v-icon {{ item.icon }}
        v-list-tile-content
          v-list-tile-title {{ item.text }}
      v-subheader(class="mt-3 grey--text text--darken-1") SUBSCRIPTIONS
</template>

<script>
export default {
  name: 'SidebarNavigation',
  data () {
    return {
      drawer: true,
      items: [
        { icon: 'trending_up', text: 'Most Popular' },
        { icon: 'subscriptions', text: 'Subscriptions' },
        { icon: 'history', text: 'History' },
        { icon: 'featured_play_list', text: 'Playlists' },
        { icon: 'watch_later', text: 'Watch Later' }
      ]
    }
  },
  created () {
    // 사이드바 활성 이벤트
    this.$event.$on('SidebarNavigation_drawer', () => {
      this.drawer = !this.drawer
    })
  }
}
</script>

<style lang="scss" scoped>

</style>
