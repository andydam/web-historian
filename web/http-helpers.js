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

exports.checkAssets = function(request, response) {
  //check if proper POST request
  if (request.url === '/request') {
    //declare variable to store data
    let requestData = '';
    request.on('data', data => {
      //add data to requestData as received
      requestData += data;
    });
    request.on('end', ()=> {
      //once data is all received, parse data
      requestData = JSON.parse(requestData);
      //pull requested url from request data
      let requestUrl = requestData.url;
      //check if url is already in sites.txt
      archive.isUrlInList(requestUrl, (inList, archived) => {
        if (!inList && !archived) {
          //url is not in sites.txt, add to list
          archive.addUrlToList(requestUrl, err => {
            response.writeHead(202, exports.headers);
            response.end('url was accepted and waiting to be archived');
          });
        } else if (inList && !archived) {
          //url is in sites.txt but not yet archived
          response.writeHead(202, exports.headers);
          response.end('url was already accepted and waiting to be archived');
        } else if (inList && archived) {
          //url is in sites.txt and archived
          response.writeHead(201, exports.headers);
          response.end('url is archived');
        }
      });
    });
  }
};


// As you progress, keep thinking about what helper functions you can put here!
