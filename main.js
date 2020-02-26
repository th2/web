'use strict'
var bodyParser = require('body-parser')
var express = require('express')
var app = express()
var config = require('./config/main.json')
var router = require('./router')
var logger = require('./logger')

app.use(function (req, res, next) {
  logger.visitor(req, 0)
  next()
})
app.use(express.static('site'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', router)

module.exports.server = app.listen(config.mainPort, function () {
  console.log('listening on port ' + config.mainPort)
})
