'use strict'
var secrets = require('./config/secrets')
var fs = require('fs.extra')
var util = require('util')
var fetch = require('isomorphic-fetch')
var Dropbox = require('dropbox').Dropbox
var dbx = new Dropbox({ accessToken: secrets.dropbox_token, fetch: fetch })
var logger = require('./logger')

module.exports.getDBfileFromAPI = function (url, res) {
  dbx.sharingListSharedLinks({path: url})
  .then(function (response) {
    if (response.links.length === 0) {
      dbx.sharingCreateSharedLinkWithSettings({path: url})
      res.redirect(url)
    } else {
      res.redirect(response.links[0].url.replace('?dl=0', '?raw=1'))
    }
  })
  .catch(function (error) {
    logger.info(error)
    res.sendStatus(404)
  })
}

function cacheDBfileFromAPI (url, res) {
  if (url.includes('/undefined')) {
    logger.info('iris.cacheDBfileFromAPI undefined: ' + url)
    return false
  }

  dbx.sharingListSharedLinks({path: url})
  .then(function (response) {
    if (response.links.length === 0) {
      dbx.sharingCreateSharedLinkWithSettings({path: url}).then(function () { cacheDBfileFromAPI(url, res) })
    } else {
      var dbUri = response.links[0].url.replace('?dl=0', '?raw=1')
      var cacheUrl = './cache/link' + url
      var path = cacheUrl.substring(0, cacheUrl.lastIndexOf('/'))
      fs.mkdirpSync(path)
      fs.writeFile('./cache/link' + url, dbUri, 'utf8', function (err) {
        if (err) { return logger.info('save cache error: ' + url) }
        // logger.info('saved cache: ' + url + ':' + dbUri)
        res.redirect(dbUri)
      })
    }
  })
  .catch(function (err) {
    logger.info('iris.cacheDBfileFromAPI.sharingListSharedLinks error: ' + url + '\n' + err)
    res.sendStatus(404)
  })
}

module.exports.getFile = function (url, res) {
  fs.readFile('./cache/link' + url, 'utf8', function (err, data) {
    if (err) cacheDBfileFromAPI(url, res)
    else if (data === '404') res.sendStatus(404)
    else res.redirect(data)
  })
}

function cacheDBthumbFromAPI (url, cacheUrl, res) {
  dbx.filesGetThumbnail({path: '/images' + url, size: 'w128h128'})
  .then(function (response) {
    fs.writeFile(cacheUrl, response.fileBinary, 'binary', function (err) {
      if (err) { return logger.info('save thumb error: ' + url) }
      res.contentType('image/jpeg')
      res.end(response.fileBinary, 'binary')
    })
  })
  .catch(function (err) {
    logger.info('error thumb db api: ' + url + ':' + err)
    res.sendStatus(404)
  })
}

module.exports.getThumb = function (url, res) {
  url = url.substring(7) // strip '/thumbs'
  var cacheUrl = './cache/thumb' + url
  var path = cacheUrl.substring(0, cacheUrl.lastIndexOf('/'))
  fs.mkdirpSync(path)

  res.sendFile(cacheUrl, { root: 'cache/', dotfiles: 'deny' }, function (err) {
    if (err) {
      if (err.statusCode === 404) cacheDBthumbFromAPI(url, cacheUrl, res)
      else {
        logger.info('error thumb: ' + url + ':' + util.inspect(err))
        res.sendStatus(404)
      }
    }
  })
}
