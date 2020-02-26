'use strict'
// includes
var fs = require('fs')
var util = require('util')
var dateFormat = require('dateformat')
var secrets = require('./config/secrets')

module.exports.visitor = function (req, user) {
  var visit = {}
  visit.date = Date.now()
  visit.url = req.url
  visit.method = req.method
  visit.body = req.body
  visit.user = user
  visit.headers = req.headers

  fs.appendFile('log/visit/' + dateFormat(new Date(), 'yyyy-mm-dd') + '.json', JSON.stringify(visit) + ',\n', function (err) {
    if (err) throw err
  })

  var message = ''
  message += visit.url + ' '
  if (visit.method !== 'GET') {
    message += ' ' + visit.method
  }
  if (visit.body && Object.keys(visit.body).length !== 0) {
    message += ' ' + util.inspect(visit.body)
  }
  message += ' ' + util.inspect(visit.headers)
}

module.exports.info = function (err) {
  var now = new Date()
  console.log(now.toISOString() + ' ' + err)
  fs.appendFile('log/info/' + dateFormat(now, 'yyyy-mm-dd') + '.json', JSON.stringify(err) + ',', function (err) {
    if (err) throw err
  })
}

module.exports.exception = function (err) {
  var now = new Date()
  console.log(now.toISOString() + ' ' + err)
  fs.appendFile('log/error/' + dateFormat(now, 'yyyy-mm-dd') + '.json', JSON.stringify(err) + ',', function (err) {
    if (err) throw err
  })
}
