// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.

//require archive-helpers module
var archive = require('../helpers/archive-helpers');
//run readListOfUrls to get list of urls
archive.readListOfUrls(listOfUrls => {
  let downloadList = [];
  //iterate through list of urls
  for (let url in listOfUrls) {
    if (!listOfUrls[url]) {
      //add url to download list
      downloadList.push(url);
    }
  }
  //run web crawler on urls that are false
  archive.downloadUrls(downloadList);

  //change url to true once web crawler is done
  for (let i = 0; i < downloadList.length; i++) {
    listOfUrls[downloadList[i]] = true;
  }

  fs.writeFileSync(archive.paths.list, JSON.stringify(listOfUrls));
});
