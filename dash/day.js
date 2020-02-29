'use strict'
const express = require('express')
const fs = require('fs')
const secrets = require('../config/secrets')
const router = express.Router()

router.get('/:day', function (req, res) {
  let page = `<html><head>
  <title>Dash ${req.params.day}</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
  <link rel="stylesheet" href="/dash.css">
  </head><body class=".bg-dark">`
  
  const lines = fs.readFileSync(`log/visit/${req.params.day}`).toString().split("\n")
  let pathmap = new Map()
  for (let i in lines) {
    if (lines[i].startsWith('{')) {
      let visit = JSON.parse(lines[i])
      let path = visit.meta.req.headers.host + ' ' + visit.message
      pathmap.set(path, pathmap.get(path) + 1 || 1)
    }
  }
  let patharray = []
  pathmap.forEach ((v,k) => { patharray.push({path: k, count: v}) })
  patharray = patharray.sort((a, b) => b.count - a.count)
  page += `<table class="table table-dark table-striped">
    <thead>
    <tr>
    <th>path</th>
    <th>count</th>
    </tr>
    </thead>`
  for (let i in patharray) {
    page += `<tr>
    <td>${patharray[i].path}</td>
    <td>${patharray[i].count}</td>
      </tr>`
  }
  page += '</table>'
  page += '</body></html>'
  res.send(page)
})


router.get('/:day/all', function (req, res) {
  let page = `<html><head>
  <title>Dash ${req.params.day}</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
  <link rel="stylesheet" href="/dash.css">
  </head><body class=".bg-dark">`
  page += generateVisitTable(req.params.day)
  page += '</body></html>'
  res.send(page)
})

function generateVisitTable(day) {
  const lines = fs.readFileSync(`log/visit/${day}`).toString().split("\n")
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
      sourcetable += `<tr>
      <td>${visit.timestamp}</td>
      <td>${visit.level}</td>
      <td>${visit.message}</td>
      <td>${JSON.stringify(visit.meta.req)}</td>
      <td>${JSON.stringify(visit.meta.res)} responseTime:${visit.meta.responseTime}</td>
      </tr>`
    }
  }



  sourcetable += '</table>'
  return `${sourcetable}`
}


module.exports = router