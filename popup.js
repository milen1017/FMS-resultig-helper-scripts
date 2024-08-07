document.getElementById('toggleButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.contextMenus.create({
        id: "toggleHideTables",
        title: "Hide IR games",
        contexts: ["all"]
      });
    });
  });
  