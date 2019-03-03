<template lang="pug">
  v-content.content_wrap
    v-container(fluid grid-list-md)
      v-layout(wrap)
        v-flex(v-for="card in cards" :key="card.title" xs6 md3)
          v-hover
            v-card(slot-scope="{ hover }" :class="`elevation-${hover ? 12 : 2}`")
              v-img(:src="card.src" height="200px")

                v-container(fill-height fluid pa-2)

                  v-layout(fill-height)
                    v-flex(xs12 align-end flexbox)
                      span(class="headline white--text" v-text="card.title")

              v-card-actions
                v-spacer
                v-btn(icon)
                  v-icon favorite

                v-btn(icon)
                  v-icon bookmark

                v-btn(icon)
                  v-icon share
</template>

<script>
export default {
  name: 'ContentCard',
  data () {
    return {
      cards: [
        { title: 'Pre-fab homes', src: 'https://cdn.vuetifyjs.com/images/cards/house.jpg', flex: 3 },
        { title: 'Favorite road trips', src: 'https://cdn.vuetifyjs.com/images/cards/road.jpg', flex: 3 },
        { title: 'Best airlines', src: 'https://cdn.vuetifyjs.com/images/cards/plane.jpg', flex: 3 },
        { title: 'Best airlines123123', src: 'https://cdn.vuetifyjs.com/images/cards/plane.jpg', flex: 3 }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
  .content_wrap {
  }
</style>
