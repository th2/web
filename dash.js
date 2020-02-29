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
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
  <link rel="stylesheet" href="/dash.css">
  <script src="sortabletable.js" language="javascript" type="text/javascript"></script>
  <script src="tfAdapter.sortabletable.js" language="javascript" type="text/javascript"></script>
  </head><body>`
  page += generateVisitTable(req.params.day)
  page += '<body class=".bg-dark"></html>'
  res.send(page)
})

function generateVisitTable(day) {
  const lines = fs.readFileSync(`log/visit/${day}`).toString().split("\n")
  let pathmap = new Map()
  let sourcetable = `<table class="table table-dark table-striped"><tr>
    <th>timestamp</th>
    <th>level</th>
    <th>message</th>
    <th>meta.req</th>
    <th>meta.res</td>
    </tr>`
  for (let i in lines) {
    if (lines[i].startsWith('{')) {
      let visit = JSON.parse(lines[i])
      pathmap.set(visit.message, pathmap.get(visit.message) + 1 || 1)
      sourcetable += `<tr>
      <td>${visit.timestamp}</td>
      <td>${visit.level}</td>
      <td>${visit.message}</td>
      <td>${JSON.stringify(visit.meta.req)}</td>
      <td>${JSON.stringify(visit.meta.res)} responseTime:${visit.meta.responseTime}</td>
      </tr>`
    }
  }

  let pathtable = `<table class="table table-dark table-striped">
    <thead>
    <tr>
    <th>path</th>
    <th>count</th>
    </tr>
    </thead>`
  for (let [path, count] of pathmap) {
    pathtable += `<tr>
    <td>${path}</td>
    <td>${count}</td>
      </tr>`
  }
  pathtable += '</table>'

  sourcetable += '</table>'
  return `${pathtable}<br/>${sourcetable}`
}


module.exports = router