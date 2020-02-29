'use strict'
var bodyParser = require('body-parser')
var express = require('express')
var expressWinston = require('express-winston')
var winston = require('winston')
require('winston-daily-rotate-file')
var router = require('./router')
var config = require('./config/main.json')
var app = express()

var visitTransport = new (winston.transports.DailyRotateFile)({
  filename: 'log/visit/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json())
})
var errorTransport = new (winston.transports.DailyRotateFile)({
  filename: 'log/error/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json())
})

app.use(expressWinston.logger({ transports: [visitTransport] }))
app.use(express.static('site'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', router)
app.use(expressWinston.errorLogger({ transports: [errorTransport] }))

module.exports.server = app.listen(config.mainPort, function () {
  console.log('listening on port ' + config.mainPort)
})
