

var cssFile = chrome.runtime.getURL('trelloGroup.css');
var laneIndicator = '|';
var boardTrelloGroupsActiveClass = 'trelloGroups';



function setTrelloGroup(board) {
   
    board.classList.remove(boardTrelloGroupsActiveClass);
    board.classList.add(boardTrelloGroupsActiveClass);
}


function findGroups(board) {

    var headerNames = document.querySelectorAll('[data-testid="list-name"]');
    for (let headerName of headerNames) {

        var headerNameValue = headerName.innerText;
        
        var closestListWrapper = headerName.closest('[data-testid="list-wrapper"]');

        if ((headerNameValue.indexOf(laneIndicator) > -1)) {
            groupExist = true;
            // board.classList.add(boardTrelloGroupsActiveClass);

            if (closestListWrapper) {
                // On change, we update the attribute
                // IF That attribute already exists, use that for the lane title. Otherwise, its init title
                // This is because the html doesn't seem to be updating fast enough to use on change
                if (closestListWrapper.getAttribute('data-group-title')) {
                    if (closestListWrapper.getAttribute('data-group-title').length > 2)
                    {
                        headerNameValue = closestListWrapper.getAttribute('data-group-title');
                    }
                }

                closestListWrapper.classList.add('group-start');
                var groupName = headerNameValue;
                if (headerNameValue.indexOf(laneIndicator) > -1) {
                    groupName = headerNameValue.substring(headerNameValue.indexOf(laneIndicator)).replace(laneIndicator, '');
                }
                
                    closestListWrapper.setAttribute('data-group-title', groupName);


            }
        } else {
            if (closestListWrapper) {
                closestListWrapper.classList.remove('group-start');
                closestListWrapper.classList.add('group-item');

            }
        }

        setTrelloGroup(board);
    }

   

};


function insertCustomCss() {
    if (document.getElementById('trelloGroupcss') === null) {
        var css = document.createElement('link');
        css.id = 'trelloGroupcss';
        css.type = 'text/css';
        css.rel = 'stylesheet';
        css.href = cssFile;
        document.getElementsByTagName('head')[0].appendChild(css);
    }
}


function setEvents(board) {
    //Add listener to adjust classes if the lists are moved around
    var listElements = document.querySelectorAll('[data-testid="list-wrapper"]');
    for (var header of listElements) {
        header.addEventListener('dragend', findGroups, false);

        header.addEventListener("change", (event) => {
            // result.textContent = `You like ${event.target.value}`;
            var groupName = event.target.value
            var closestListWrapper = event.target.closest('[data-testid="list-wrapper"]');
            closestListWrapper.querySelector('[data-testid="list-name"]').innerHTML = groupName

            closestListWrapper.setAttribute('data-group-title', event.target.value);
            findGroups(board);
        });
    }
}


// Function from: https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

waitForElm('[data-testid="list-name"]').then((elm) => {

    var board = document.getElementById('board');

    findGroups(board);
    setEvents(board);
    setTrelloGroup(board);
    insertCustomCss();


    chrome.storage.sync.get('isInactive', function (result) {
        var board = document.getElementById('board');

        try {
            if (result.isInactive) {
                board.classList.remove(boardTrelloGroupsActiveClass);
            } else {
                board.classList.add(boardTrelloGroupsActiveClass);
            }
        } catch (e) {
            board.classList.add(boardTrelloGroupsActiveClass);
        }

    });

});

