document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("status");

  // Function to update the status display
  const updateStatus = (isActive) => {
    if (isActive) {
      statusElement.textContent = "Status: Hidden";
    } else {
      statusElement.textContent = "Status: Shown";
    }
  };

  // Get the current status from chrome.storage
  chrome.storage.local.get(["isActive"], (result) => {
    updateStatus(result.isActive);
  });

  // Listen for updates from the background script
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "updateStatus") {
      updateStatus(request.isActive);
    }
  });
});
