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
  res.writeHead(code, headers);
  res.end(data);
};

exports.serveAssets = function(res, asset, callback) {
  //default to index if no asset path passed
  asset === '/' ? asset = '/index.html' : asset = asset;
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
            sendResponse(response, 202, JSON.stringify({'archived': false}));
          });
        } else if (inList && !archived) {
          //url is in sites.txt but not yet archived
          sendResponse(response, 202, JSON.stringify({'archived': false}));
        } else if (inList && archived) {
          //url is in sites.txt and archived
          sendResponse(response, 201, JSON.stringify({'archived': true}));
        }
      });
    });
  }
};


// As you progress, keep thinking about what helper functions you can put here!
