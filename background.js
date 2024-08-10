let isActive = false;

// Load the persisted state of isActive when the extension is loaded
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["isActive"], (result) => {
    isActive = result.isActive || false;
    console.log(`Extension loaded. Initial state isActive: ${isActive}`);
  });

  // Create separate context menu items for hiding and showing IR games
  chrome.contextMenus.create({
    id: "hideIRTables",
    title: "Hide IR games",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "showIRTables",
    title: "Show IR games",
    contexts: ["all"],
  });

  console.log('Context menus for hiding and showing IR games created.');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "hideIRTables") {
    isActive = true;
    console.log('Hide IR games menu clicked.');

    // Persist the state and notify the popup
    chrome.storage.local.set({ isActive }, () => {
      console.log('State persisted to storage.');
      chrome.runtime.sendMessage({ action: "updateStatus", isActive });
    });

    // Inject the script to hide tables
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: hideTables,
    });
  } else if (info.menuItemId === "showIRTables") {
    isActive = false;
    console.log('Show IR games menu clicked.');

    // Persist the state and notify the popup
    chrome.storage.local.set({ isActive }, () => {
      console.log('State persisted to storage.');
      chrome.runtime.sendMessage({ action: "updateStatus", isActive });
    });

    // Inject the script to show tables
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showTables,
    });
  }
});

// Define the hideTables function
function hideTables() {
  console.log('hideTables function called.');

  const hideIRTables = () => {
    const matchPanelTables = document.querySelectorAll('table.matchPanel');
    let tablesHidden = 0;
    matchPanelTables.forEach((table) => {
      const coverageDiv = table.querySelector('div.coverageLevel');
      if (coverageDiv && coverageDiv.textContent.trim() === 'IR') {
        table.style.display = 'none';
        tablesHidden++;
      }
    });
    console.log(`${tablesHidden} tables hidden.`);
  };

  hideIRTables();

  // Observe only when dynamic changes might affect the IR tables
  if (!window.hideTablesObserver) {
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length || mutation.removedNodes.length) {
          shouldReapply = true;
        }
      });
      if (shouldReapply) {
        console.log('Dynamic change detected, reapplying hide logic.');
        hideIRTables(); // Reapply hiding logic
      }
    });

    // Start observing the body for child additions/removals
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.hideTablesObserver = observer;
    console.log('MutationObserver started.');
  }
}

// Define the showTables function
function showTables() {
  console.log('showTables function called.');

  if (window.hideTablesObserver) {
    window.hideTablesObserver.disconnect();
    window.hideTablesObserver = null;
    console.log('MutationObserver disconnected.');
  }

  const matchPanelTables = document.querySelectorAll('table.matchPanel');
  let tablesShown = 0;
  matchPanelTables.forEach((table) => {
    const coverageDiv = table.querySelector('div.coverageLevel');
    if (coverageDiv && coverageDiv.textContent.trim() === 'IR') {
      table.style.display = '';
      tablesShown++;
    }
  });
  console.log(`${tablesShown} tables shown.`);
}
