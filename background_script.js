// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//     // Match Trello board pages only
//     var regex = new RegExp(/.*:\/\/trello\.com\/b\/.*/);
//     var match = regex.exec(tab.url);
  
//     // Setup page for layout changes and show page action
//     if (match) {
//       chrome.tabs.executeScript(null, {file: 'content_script.js'});
//       // chrome.pageAction.show(tabId);
//     }
//     else {
//       // chrome.pageAction.hide(tabId);
//     }
//   });
  

  chrome.tabs.onUpdated.addListener(function () {
    chrome.scripting.executeScript(null, { file: "content_script.js" });
  });