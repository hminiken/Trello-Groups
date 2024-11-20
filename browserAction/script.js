// function reportError(error) {
//     console.log(`error: failed to change layout on page: ${error.message}`);
// }

// function reportScriptError() {
//     document.querySelector("#layout-options").classList.add("hidden");
//     document.querySelector("#error-content").classList.remove("hidden");
// }


// //immediately close popup
// function closePopup() {
//     window.close();
// }

// //browser independence
// if (typeof browser === "undefined") {
//     var browser = chrome;
// }

// browser.tabs.executeScript({ file: "/toggle.js" });
// closePopup();






//   chrome.tabs.onUpdated.addListener(function () {
//     console.log("TAB UPDATED")
//     getTab().then(id => {
//         console.log(id);
//     })

//     getTab().then(chrome.scripting.executeScript({
//         target: {tabId: getTab()},
//         files : ["/toggle.js"],
//     })
// )
// })
// async function getTab() {
//     let queryOptions = { active: true, currentWindow: true };
//     let tabs = await chrome.tabs.query(queryOptions);
//     return tabs[0].id;
//   }

// chrome.tabs.onUpdated.addListener(async function () {
//     console.log("TAB UPDATED")
//     // let id = 
//     // console.log(id);
//     chrome.scripting.executeScript({
//                 target: {tabId: await getTab()},
//                 files : ["/toggle.js"],
//             }).then(window.close())
// })


// chrome.scripting.executeScript(async function () {
//     // let id = 
//     // console.log(id);
// {
//         target: {tabId: await getTab()},
//         files : ["/toggle.js"],
//     }
// })




// async function getCurrentTabId() {
//     let queryOptions = {
//         active: true,
//         currentWindow: true
//     };
//     let [tab] = await chrome.tabs.query(queryOptions);
//     return tab.id;
// };

// chrome.scripting.executeScript({
//     target: {tabId: await getCurrentTabId()},
//     files: ["/toggle.js"]
// }).then(window.close());



(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
  
        files: ['/toggle.js'],
      }).then(window.close());
    } catch (erri) {
      console.error(`failed to execute script: ${erri}`);
    }
  })();


// function getTabId() {
//     let tabs = chrome.tabs.query({currentWindow: true, active : true});
//     return tabs[0].id;
// }

// chrome.scripting.executeScript({
//     target: {tabId: getTabId()},
//     files : ["/toggle.js"],
// })
// .then(() => console.log("Script injected"));