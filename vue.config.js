'use strict'

module.exports = {
  outputDir: '../vuerd-backend/public',
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
