<template lang="pug">
  .grid_canvas
    grid.table_detail(:rowData="rows" :columnData="columns")
</template>

<script>
import 'tui-grid/dist/tui-grid.css'
import Grid from '@toast-ui/vue-grid/src/Grid'

export default {
  name: 'CanvasGrid',
  components: {
    Grid
  },
  data () {
    return {
      rows: [ // for rowData prop
        {
          name: 'Beautiful Lies',
          artist: 'Birdy'
        },
        {
          name: 'X',
          artist: 'Ed Sheeran'
        }
      ],
      columns: [ // for columnData prop
        {
          title: 'Name',
          name: 'name'
        },
        {
          title: 'Artist',
          name: 'artist'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
  .grid_canvas {
    position: fixed;
    bottom: 0;
    left: 40px;
    z-index: 2147483647;

    .table_detail {
      
    }
  }
</style>
