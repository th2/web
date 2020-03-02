'use strict'
const express = require('express')
const fs = require('fs')
const extractor = require('./extractor')
const secrets = require('../config/secrets')
const router = express.Router()
const skipPreFilter = true

function readVisits(day, query) {
  let visits = []
  let lines = fs.readFileSync(`log/visit/${day}`).toString().split("\n")
  for (let i in lines) {
    if (lines[i].startsWith('{')) {
      let visit = JSON.parse(lines[i])
      if (skipPreFilter || !isFiltered(visit, query)) {
        visits.push(visit)
      }
    }
  }
  return visits
}

function isFiltered(visit, query) {
  for(let i in query) {
    if(query[i].ex &&
      query[i].type == 'agent' &&
      query[i].value == extractor.agent(visit) ) {
        return true
      }
  }
  return false
}

function isFilteredAggregate(aggregate, query) {
  for(let i in query) {
    if(query[i].ex &&
      query[i].value == aggregate) {
        return true
      }
  }
  return false
}

function aggregateTable(visits, valueType, valueFunction, query) {
  let aggregation = extractor.aggregateCount(visits, valueFunction)
  let page = `<table class="table table-dark table-striped">
    <thead><tr><th>path</th><th>count</th></tr></thead>`
  for (let i in aggregation) {
    let highlight = ''
    if(isFilteredAggregate(aggregation[i].value, query)) {
      highlight = 'background-color:red;'
    }
    page += `<tr>
      <td style="text-align:center;${highlight}">${aggregation[i].count}
      <a href="onclick:include('${valueType}', '${aggregation[i].value}')">➕</a>
      <a href="onclick:exclude('${valueType}', '${aggregation[i].value}')">➖</a></td>
      <td>${aggregation[i].value}</td>
    </tr>`
  }
  page += '</table>'
  return page
}

function visitTable(visits, query) {
  let sourcetable = `<table class="table table-dark table-striped"><tr>
    <th>timestamp</th><th>level</th><th>message</th><th>meta.req</th><th>meta.res</td></tr>`
  for (let i in visits) {
    let visit = visits[i]
    if(!isFiltered(visit, query)) {
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
  return sourcetable
}

router.use('/:day', function (req, res) {
  let query = []
  if(req.body && req.body.query) {
    query = JSON.parse(req.body.query)
  }
  let visits = readVisits(req.params.day, query)
  res.send(`
  <html><head>
    <title>Dash ${req.params.day}</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <link rel="stylesheet" href="/dash.css">
    <script>
    Array.from(document.getElementsByClassName("submit")).forEach(element => 
      element.addEventListener('keydown', () => { if (event.keyCode == 13) { this.form.submit() }}, false))
    </script>
  </head><body class=".bg-dark">
    <div class="row">
      <div class="col">
        <form method="post">
          <a href="/dash/">🔙</a>
          <input type="text" name="datefrom" value="${req.params.day}" class="submit" />
          <input type="text" name="dateto" value="${req.params.day}" class="submit" />
          <input type="submit" value="↩️" class="submit" />
          <textarea name="query" style="width: 100%" class="submit">${req.body.query}</textarea>
        </form>
      </div>
    </div>
    <div class="row">
      <div class="col" style="height: 500px; overflow-y: scroll;">
        ${aggregateTable(visits, 'path', extractor.path, query)}
      </div>
      <div class="col" style="height: 500px; overflow-y: scroll;">
        ${aggregateTable(visits, 'address', extractor.address, query)}
      </div>
      <div class="col" style="height: 500px; overflow-y: scroll;">
        ${aggregateTable(visits, 'agent', extractor.agent, query)}
      </div>
    </div>
    <div class="row">
      <div class="col">
        ${visitTable(visits, query)}
      </div>
    </div>
  </body></html>`)
})

module.exports = router