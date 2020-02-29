'use strict'
const express = require('express')
const fs = require('fs')
const secrets = require('./config/secrets')
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

router.get('/day/:day', function (req, res) {
  let page = `<html><head>
  <title>Dash ${req.params.day}</title>
  <link rel="stylesheet" type="text/css" href="/dash.css">
  </head><body>`
  page += generateVisitTable(req.params.day)
  page += '<body></html>'
  res.send(page)
})

function generateVisitTable(day) {
  const lines = fs.readFileSync(`log/visit/${day}`).toString().split("\n")
  let table = '<table>'
  for (let i in lines) {
    if (lines[i].startsWith('{')) {
      let visit = JSON.parse(lines[i])
      table += `<tr>
      <td>${visit.timestamp}</td>
      <td>${visit.level}</td>
      <td>${visit.message}</td>
      <td>${JSON.stringify(visit.meta.req)}</td>
      <td>${JSON.stringify(visit.meta.res)} responseTime:${visit.meta.responseTime}</td>
      </tr>`
    }
  }
  table += '</table>'
  return table
}

module.exports = router