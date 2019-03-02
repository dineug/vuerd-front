'use strict'

module.exports = {
  outputDir: process.env.OUTPUT_DIR,
  publicPath: process.env.PUBLIC_PATH,
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
