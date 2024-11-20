var board = document.getElementById('board');
console.log(board);

if (board.classList.contains('trelloGroups')) {
    board.classList.remove('trelloGroups');
    chrome.storage.sync.set({'isInactive': true});
  } else {
    board.classList.add('trelloGroups');
    chrome.storage.sync.set({'isInactive': false});
  }
  
