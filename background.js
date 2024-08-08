let isActive = false;

chrome.runtime.onInstalled.addListener(() => {
  // Create the context menu item for toggling the IR games
  chrome.contextMenus.create({
    id: "toggleHideTables",
    title: "Toggle IR games",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggleHideTables") {
    isActive = !isActive;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [isActive ? "hideTables.js" : "showTables.js"],
    });
  }
});


