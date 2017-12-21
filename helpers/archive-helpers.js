var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');

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
    //check if data is json, if json parse data, if not json, return empty object as data
    //return data to callback
    data.toString().startsWith('{') && data.toString().endsWith('}') ? callback(JSON.parse(data)) : callback({});
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

fs.mkdirParent = function(dirPath, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.errno === 34) {
      //Create all the parents recursively
      fs.mkdirParent(path.dirname(dirPath), mode, callback);
      //And then the directory
      fs.mkdirParent(dirPath, mode, callback);
    }
    //Manually run the callback since we used our own callback to do all these
    callback && callback(error);
  });
};

var mkdir = (path) => {
  //check if path exists
  if (!fs.existsSync(path)) {
    //path does not exist
    //check if immediate parent path exists
    //ex: path = /a/b/c/d, check if /a/b/c exists
    if (fs.existsSync(path.split('/').slice(0, -1).join('/'))) {
      //if exists, create /a/b/c/d
      fs.mkdirSync(path);
    } else {
      //otherwise recurse on /a/b/c
      mkdir(path.split('/').slice(0, -1).join('/'));
      //create /a/b/c/d after parents are made
      fs.mkdirSync(path);
    }
  }
};

exports.downloadUrls = function(urls) {
  //for loop to iterate through array of urls
  for (let i = 0; i < urls.length; i++) {
    //make directory for url
    mkdir(exports.paths.archivedSites + '/' + urls[i]);
    //download page at url
    request('http://'+ urls[i], (error, response, body) => {
      //load downloaded page in cheerio
      $ = cheerio.load(body);
      //iterate through page and find img tags
      $('img').each((index, element) => {
        //pull the src path of each img tag using .attr()
        let imgSrc = $(element).attr('src');
        //get a directory path to store image at
        //slice off index 0 of split src, index 0 may be a empty string or domain name
        let directory = imgSrc.split('/').slice(1, -1).join('/');
        //make directory for image
        mkdir(exports.paths.archivedSites + '/' + urls[i] + directory);
        console.log('http://'+ urls[i] + imgSrc);
        console.log(exports.paths.archivedSites + '/' + urls[i] + imgSrc);
        //download image to directory
        request('http://'+ urls[i] + imgSrc).pipe(fs.createWriteStream(exports.paths.archivedSites + '/' + urls[i] + imgSrc));
        //create a new src path that points to our downloaded image
        let newImgSrc = imgSrc.split('/');
        newImgSrc[0] = 'http://127.0.0.1:8080/archives/sites/' + urls[i];
        newImgSrc = newImgSrc.join('/');
        //change src path of img tag to point to our server
        console.log(newImgSrc);
        $(element).attr('src', newImgSrc);
      });
      //save the page to disk
      fs.writeFileSync(exports.paths.archivedSites + '/' + urls[i] + '/index.html', $.html());
    });
  }
};
