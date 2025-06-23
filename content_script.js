const cssFile = chrome.runtime.getURL('trelloGroup.css');
const laneIndicator = '|';
const boardTrelloGroupsActiveClass = 'trelloGroups';
const OBSERVER_ATTR = 'data-observer-attached';

let debounceTimer = null;

function debounceFindGroups(board) {
  findGroups(board);
}

function setTrelloGroup(board) {
  board.classList.add(boardTrelloGroupsActiveClass);
}

function getCollapsedGroups() {
  const raw = localStorage.getItem('trello-collapsed-groups');
  return new Set(raw ? JSON.parse(raw) : []);
}

function saveCollapsedGroups(groupSet) {
  localStorage.setItem('trello-collapsed-groups', JSON.stringify([...groupSet]));
}

function toggleGroupCollapse(startList, forceCollapse = null) {
  const groupTitle = startList.getAttribute('data-group-title');
  if (!groupTitle) return;

  const collapsedGroups = getCollapsedGroups();
  const isCurrentlyCollapsed = startList.classList.contains('group-collapsed');
  const shouldCollapse = forceCollapse !== null ? forceCollapse : !isCurrentlyCollapsed;

  if (shouldCollapse) {
    startList.classList.add('group-collapsed');
    startList.setAttribute('data-group-collapsed', 'true');
    collapsedGroups.add(groupTitle);
  } else {
    startList.classList.remove('group-collapsed');
    startList.removeAttribute('data-group-collapsed');
    collapsedGroups.delete(groupTitle);
  }

  // Helper function to hide/show cards container inside a list wrapper
function setListCardsVisibility(listWrapper, hide) {
  const cardsContainer = listWrapper.querySelector('[data-testid="list-cards"]');
  if (cardsContainer) {
    cardsContainer.style.display = hide ? 'none' : '';
  }
}


  // Hide/show cards in the startList itself
  setListCardsVisibility(startList, shouldCollapse);

  // Then do the same for all subsequent sibling lists until next group-start
  let next = startList.nextElementSibling;
  while (next && !next.classList.contains('group-start')) {
    setListCardsVisibility(next, shouldCollapse);
    next = next.nextElementSibling;
  }

  saveCollapsedGroups(collapsedGroups);
}


function findGroups(board) {
  const headers = document.querySelectorAll('[data-testid="list-name"]');
  const collapsedGroups = getCollapsedGroups();

  headers.forEach(header => {
    const headerValue = header.innerText.trim();
    const listWrapper = header.closest('[data-testid="list-wrapper"]');
    if (!listWrapper) return;

    if (headerValue.startsWith(laneIndicator)) {
      const groupName = headerValue.slice(laneIndicator.length).trim();
      listWrapper.classList.add('group-start');
      listWrapper.classList.remove('group-item');
      listWrapper.setAttribute('data-group-title', groupName);

      if (collapsedGroups.has(groupName)) {
        toggleGroupCollapse(listWrapper, true);
      }
    } else {
      listWrapper.classList.remove('group-start');
      listWrapper.classList.add('group-item');
      listWrapper.removeAttribute('data-group-title');
    }
  });

  setTrelloGroup(board);
  attachToggleListeners();
}

function addGlobalCollapseToggle(board) {
  if (document.getElementById('collapseToggleAll')) return;

  const btn = document.createElement('button');
  btn.id = 'collapseToggleAll';
  btn.textContent = 'Collapse/Expand All';

  // Remove absolute positioning to let it flow naturally
btn.style.margin = '0';
btn.style.padding = '4px 12px'; // keep padding you want
btn.style.display = 'inline-block';
btn.style.position = 'absolute';
btn.style.top = '10px';
btn.style.right = '10px';
btn.style.zIndex = '9999';
btn.style.lineHeight = '1.2';
btn.style.height = '30px';
btn.style.whiteSpace = 'nowrap';
btn.style.fontSize = '14px';
btn.style.border = 'none';
btn.style.borderRadius = '4px';
btn.style.background = '#026aa7';
btn.style.color = 'white';
btn.style.cursor = 'pointer';



  btn.addEventListener('click', () => {
    const allGroups = document.querySelectorAll('.group-start');
    const allCollapsed = [...allGroups].every(g => g.classList.contains('group-collapsed'));
    allGroups.forEach(group => toggleGroupCollapse(group, !allCollapsed));
  });

  // Find the first list-wrapper inside the board
  const firstList = board.querySelector('[data-testid="list-wrapper"]');
  if (firstList) {
    firstList.parentNode.insertBefore(btn, firstList);
  } else {
    // fallback to append to body if no list found
    document.body.appendChild(btn);
  }
}

function observeTitleChanges(headerSpan, board) {
  if (headerSpan.hasAttribute(OBSERVER_ATTR)) return;

  const observer = new MutationObserver(() => {
    debounceFindGroups(board);
  });

  observer.observe(headerSpan, {
    characterData: true,
    childList: true,
    subtree: true
  });

  headerSpan.setAttribute(OBSERVER_ATTR, 'true');
}

function setEvents(board) {
  const listWrappers = document.querySelectorAll('[data-testid="list-wrapper"]');

  listWrappers.forEach(listEl => {
    listEl.addEventListener('dragend', () => findGroups(board));

    const headerSpan = listEl.querySelector('[data-testid="list-name"] span');
    if (headerSpan) {
      observeTitleChanges(headerSpan, board);
    }
  });
}

function attachToggleListeners() {
  // Entire group title header (for easy toggle)
  document.querySelectorAll('[data-testid="list-name"]').forEach(header => {
    if (!header.dataset.listenerAttached) {
      header.addEventListener('click', e => {
        const listWrapper = header.closest('[data-testid="list-wrapper"]');
        if (listWrapper && listWrapper.classList.contains('group-start')) {
          toggleGroupCollapse(listWrapper);
        }
      });
      header.dataset.listenerAttached = 'true';
    }
  });
}

function insertCustomCss() {
  if (!document.getElementById('trelloGroupcss')) {
    const css = document.createElement('link');
    css.id = 'trelloGroupcss';
    css.rel = 'stylesheet';
    css.href = cssFile;
    css.type = 'text/css';
    document.head.appendChild(css);
  }
}

function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) return resolve(document.querySelector(selector));

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

function observeBoardChanges(board) {
  const observer = new MutationObserver(() => {
    findGroups(board);
    setEvents(board);
  });

  observer.observe(board, {
    childList: true,
    subtree: true
  });
}

waitForElm('[data-testid="list-name"]').then(() => {
  const board = document.getElementById('board');
  if (!board) return;

  findGroups(board);
  setEvents(board);
  observeBoardChanges(board);
  insertCustomCss();
  addGlobalCollapseToggle(board);

  chrome.storage.sync.get('isInactive', result => {
    const isInactive = result?.isInactive ?? false;

    if (isInactive) {
      board.classList.remove(boardTrelloGroupsActiveClass);
    } else {
      board.classList.add(boardTrelloGroupsActiveClass);
    }
  });
});
