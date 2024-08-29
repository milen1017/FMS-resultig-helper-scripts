

// Function to initialize all scripts
function initialize() {
  hideTables();
  observeAndAddNoteButtons(); // From notes.js
  // Initialize other functionalities if needed
}

// Call initialize to set up everything
initialize();

// Message listener for background messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'hideTables') {
    hideTables();
  } else if (message.action === 'showTables') {
    showTables();
  } else if (message.action === 'viewAllNotes') {
    viewAllNotes();
  }
});
