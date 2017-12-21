var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

exports.headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/html'
};

exports.serveAssets = function(res, asset, callback) {
  //pull full directory for requested asset
  asset.startsWith('/archives/') ? asset = __dirname + '/..' + asset : asset = __dirname + '/public' + asset;

  //use fs stat to check if asset exists at path
  fs.stat(asset, (err, stats) => {
    //check if stat doesn't return error and if asset at path is a file
    if (!err && stats.isFile()) {
      //no errors and asset at path is a file
      //create head for response
      res.writeHead(200, exports.headers);
      //read file at path
      fs.readFile(asset, (err, data) => {
        //respond back with file, add file to response body
        res.end(data);
      });
    } else {
      //error in finding file
      //respond back with 404
      res.writeHead(404, exports.headers);
      res.end();
    }
  });
};



// As you progress, keep thinking about what helper functions you can put here!
