let isActive = true;

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

  // Create context menu item for viewing all notes
  chrome.contextMenus.create({
    id: "viewAllNotes",
    title: "View All Notes",
    contexts: ["all"],
  });

  console.log('Context menus for hiding, showing IR games and viewing notes created.');
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

    // Send message to the content script to hide tables
    chrome.tabs.sendMessage(tab.id, { action: "hideTables" });
  } else if (info.menuItemId === "showIRTables") {
    isActive = false;
    console.log('Show IR games menu clicked.');

    // Persist the state and notify the popup
    chrome.storage.local.set({ isActive }, () => {
      console.log('State persisted to storage.');
      chrome.runtime.sendMessage({ action: "updateStatus", isActive });
    });

    // Send message to the content script to show tables
    chrome.tabs.sendMessage(tab.id, { action: "showTables" });
  } else if (info.menuItemId === "viewAllNotes") {
    console.log('View All Notes menu clicked.');

    // Send message to the content script to view all notes
    chrome.tabs.sendMessage(tab.id, { action: "viewAllNotes" });
  }
});
