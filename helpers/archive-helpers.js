var fs = require('fs');
var path = require('path');
var _ = require('underscore');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  //read sites.txt
  fs.readFile(exports.paths.list, (err, data) => {
    //parse json stringified data in text
    //return data to callback
    callback(JSON.parse(data));
  });
};

exports.isUrlInList = function(url, callback) {
  //checks if the url is in sites.txt
  exports.readListOfUrls(data => {
    //return to callback if url is in sites.txt
    data.hasOwnProperty(url) ? callback(true, data[url]) : callback(false, false);
  });
};

exports.addUrlToList = function(url, callback) {
  //adds url to sites.txt
  //check if url is already in list
  exports.isUrlInList(url, inList => {
    if (!inList) {
      //url is not in list
      //read existing list from file
      exports.readListOfUrls(data => {
        //add url to existing list
        data[url] = false;
        //write list back to file
        fs.writeFile(exports.paths.list, JSON.stringify(data), err => callback(err));
      });
    }
  });
};

exports.isUrlArchived = function(url, callback) {
  //check if url is archived
  exports.isUrlInList(url, (inList, archived) => {
    //use isUrlInList to see if url is archived, return result to callback
    callback(archived);
  });
};

exports.downloadUrls = function(urls) {
};
