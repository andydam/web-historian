var path = require('path');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!
var httpHelpers = require('./http-helpers');

exports.handleRequest = function (req, res) {
  //check to see what request method
  if (req.method === 'GET') {
    //GET was requested, call httpHelpers to serve asset
    httpHelpers.serveAssets(res, req.url);
  } else if (req.method === 'POST') {
    //POST was requested
    
  }
};
