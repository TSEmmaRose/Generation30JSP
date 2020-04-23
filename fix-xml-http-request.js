const fs = require('fs')
fs.readFile(
  'node_modules/xhr2-cookies/dist/xml-http-request.js',
  'utf8',
  function(err, data) {
    if (err) {
      return console.log(err)
    }

    var result = data.replace(
      new RegExp('.*_this._userAgent.+=.+Mozilla/5.0 .*;', 'i'),
      