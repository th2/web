'use strict'
var bodyParser = require('body-parser')
var express = require('express')
var logger = require('./logger')
var router = require('./router')
var config = require('./config/main.json')
var app = express()


app.use(logger.visit())
app.use(express.static('site'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', router)
app.use(logger.error())

module.exports.server = app.listen(config.mainPort, function () {
  console.log('listening on port ' + config.mainPort)
})
