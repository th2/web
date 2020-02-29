var winston = require('winston')
require('winston-daily-rotate-file')
var expressWinston = require('express-winston')

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
expressWinston.requestWhitelist.push('connection.remoteAddress')
module.exports.visit = (req, res) => expressWinston.logger({ transports: [visitTransport] })
module.exports.error = (req, res) => expressWinston.errorLogger({ transports: [errorTransport] })