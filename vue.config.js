'use strict'

module.exports = {
  publicPath: process.env.PUBLIC_PATH,
  outputDir: process.env.OUTPUT_DIR,
  configureWebpack: config => {
    config.node.global = false
  }
}
