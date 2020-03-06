'use strict'
var bodyParser = require('body-parser')
var express = require('express')
var fs = require('fs')
var https = require('https')
var logger = require('./logger')
var router = require('./router')
var config = require('./config/main.json')
var secrets = require('./config/secrets.json')
var app = express()

app.use(logger.visit())
app.use(express.static('site'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', router)
app.use(logger.error())

app.listen(config.httpPort, function () {
  console.log('http listening on port ' + config.httpPort)
})

https.createServer({
  key: fs.readFileSync(secrets.keyPath),
  cert: fs.readFileSync(secrets.certPath)
}, app)
.listen(config.httpsPort, function () {
  console.log('https listening on port ' + config.httpsPort)
})