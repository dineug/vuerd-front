'use strict'

console.log(process.env.NODE_ENV)

module.exports = {
  outputDir: process.env.OUTPUT_DIR,
  publicPath: '/static',
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  }
}
