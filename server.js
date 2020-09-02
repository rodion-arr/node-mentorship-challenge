const express = require('express')
const path = require('path')
const asyncWrap = require('./src/middleware/async')
const errorHandler = require('./src/middleware/general-error')
const depsController = require('./src/controllers/dependencies')
const minSecure = require('./src/controllers/minimum-secure')
const latestReleases = require('./src/controllers/latest-releases')

module.exports = (port = 3000) => {
  const app = express()
  const viewsDir = path.join(__dirname, 'templates', 'views')

  app.set('view engine', 'hbs')
  app.set('views', viewsDir)

  app.get('/dependencies', asyncWrap(depsController))
  app.get('/minimum-secure', asyncWrap(minSecure))
  app.get('/latest-releases', asyncWrap(latestReleases))

  app.use(errorHandler)

  return app.listen(port)
}
