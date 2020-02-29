'use strict'
const express = require('express')
const fs = require('fs')
const secrets = require('../config/secrets')
const day = require('./day')
const router = express.Router()

router.get('/', function (req, res) {
  let page = '<ul>'
  let days = fs.readdirSync('log/visit')
  for (let i in days) {
    let day = days[i]
    page += '<li><a href="day/' + day + '">' + day + '</a></li>'
  }
  page += '</ul>'
  res.send(page)
})

router.use('/day', day)

module.exports = router