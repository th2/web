'use strict'
var express = require('express')
var router = express.Router()
var path = require('path')
var httpProxy = require('http-proxy')
var proxy = httpProxy.createProxyServer({})
var iris = require('./iris')
var secrets = require('./config/secrets')

router.use('/', function (req, res) {
  if (req.url.includes('..')) {
    res.sendStatus(404)
  } else if (req.hostname === secrets.travel_page) {
    if (req.url.startsWith('/images/') || req.url.startsWith('/videos')) {
      iris.getFile(req.url, res)
    } else if (req.url.startsWith('/thumbs/')) {
      iris.getThumb(req.url, res)
    } else {
      proxy.web(req, res, { target: 'http://127.0.0.1:4000' })
    }
  } else {
    res.send('')
  }
})

module.exports = router
