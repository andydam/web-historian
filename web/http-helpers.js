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

sendResponse = (res, code, data, headers = exports.headers) => {
  //sends response back
  res.writeHead(code, headers);
  res.end(data);
};

exports.serveAssets = function(res, asset, callback) {
  //default to index if no asset path passed
  asset.endsWith('/') ? asset += '/index.html' : asset = asset;
  //pull full directory for requested asset
  asset.startsWith('/archives/') ? asset = __dirname + '/..' + asset : asset = __dirname + '/public' + asset;

  //use fs stat to check if asset exists at path
  fs.stat(asset, (err, stats) => {
    //check if stat doesn't return error and if asset at path is a file
    if (!err && stats.isFile()) {
      //no errors and asset at path is a file
      //read file at path
      fs.readFile(asset, (err, data) => {
        //respond back with file, add file to response body
        sendResponse(res, 200, data);
      });
    } else {
      //error in finding file
      //respond back with 404
      sendResponse(res, 404);
    }
  });
};

exports.checkAssets = function(request, response) {
  //check if proper POST request
  if (request.url === '/') {
    //declare variable to store data
    let requestData = '';
    request.on('data', data => {
      //add data to requestData as received
      requestData += data;
    });
    request.on('end', ()=> {
      //once data is all received, parse data
      let requestUrl = requestData.split('=')[1];
      //check if url is already in sites.txt
      archive.isUrlInList(requestUrl, (inList, archived) => {
        if (!inList && !archived) {
          //url is not in sites.txt, add to list
          archive.addUrlToList(requestUrl, err => {
            exports.serveAssets(response, '/loading.html');
          });
        } else if (inList && !archived) {
          //url is in sites.txt but not yet archived
          exports.serveAssets(response, '/loading.html');
        } else if (inList && archived) {
          //url is in sites.txt and archived
          exports.serveAssets(response, '/archives/sites/' + requestUrl + '/');
        }
      });
    });
  }
};
