module.exports.path = (x) => { 
  return x.meta.req.headers.host + ' ' + x.message
}

module.exports.address = (x) => { 
  if(x.meta.req.connection) { 
    return x.meta.req.connection.remoteAddress 
  } else {
    return 'unknown'
  }
}

module.exports.agent = (x) => { 
  return x.meta.req.headers['user-agent'] + ' ' +
  x.meta.req.headers['accept-encoding'] + ' ' +
  x.meta.req.headers['accept-language'] 
}

module.exports.aggregateCount = function(visits, valueFunction) {
    let countMap = new Map()
    for (let i in visits) {
      let value = valueFunction(visits[i])
      countMap.set(value, countMap.get(value) + 1 || 1)
    }
    let resultArray = []
    countMap.forEach ((c, v) => { resultArray.push({value: v, count: c}) })
    resultArray = resultArray.sort((a, b) => b.count - a.count)
    return resultArray
  }