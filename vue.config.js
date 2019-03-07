'use strict'

module.exports = {
  publicPath: process.env.PUBLIC_PATH,
  configureWebpack: config => {
    config.node.global = false
  }
}
