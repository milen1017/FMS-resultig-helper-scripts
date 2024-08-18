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
  } else if (info.menuItemId === "viewAllNotes") {
    console.log('View All Notes menu clicked.');

    // Inject the script to view all notes
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: viewAllNotes,
    });
  }
});

// Define the viewAllNotes function
function viewAllNotes() {
  console.log('viewAllNotes function called.');

  chrome.storage.local.get(null, (items) => {
    const notes = [];
    for (const [key, value] of Object.entries(items)) {
      if (key.startsWith('Note: ')) {
        notes.push({ key: key.replace('Note: ', ''), value });
      }
    }

    if (notes.length === 0) {
      alert('No notes found.');
      return;
    }

    const popup = document.createElement('div');
    popup.className = 'notes-popup';
    popup.style.position = 'fixed';
    popup.style.width = '400px';
    popup.style.height = '300px';
    popup.style.backgroundColor = '#fff';
    popup.style.border = '1px solid #ccc';
    popup.style.padding = '20px';
    popup.style.overflowY = 'scroll';
    popup.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '1000';

    notes.forEach(note => {
      const noteContainer = document.createElement('div');
      noteContainer.style.marginBottom = '15px';
      noteContainer.style.position = 'relative';
      noteContainer.style.backgroundColor = '#f9f9f9';
      noteContainer.style.padding = '10px';
      noteContainer.style.borderRadius = '5px';

      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '&times;';
      deleteButton.style.position = 'absolute';
      deleteButton.style.top = '5px';
      deleteButton.style.right = '5px';
      deleteButton.style.border = 'none';
      deleteButton.style.background = 'none';
      deleteButton.style.fontSize = '18px';
      deleteButton.style.cursor = 'pointer';
      deleteButton.style.padding = '0';
      deleteButton.style.lineHeight = '18px';
      deleteButton.style.width = '18px';
      deleteButton.style.height = '18px';
      deleteButton.style.borderRadius = '50%';
      deleteButton.style.color = '#888';
      deleteButton.title = 'Delete note';

      deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.color = '#333';
        deleteButton.style.background = '#e0e0e0';
      });

      deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.color = '#888';
        deleteButton.style.background = 'none';
      });

      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        if (confirm(`Are you sure you want to delete the note for "${note.key}"?`)) {
          chrome.storage.local.remove(`Note: ${note.key}`, () => {
            console.log(`Note deleted: ${note.key}`);
            noteContainer.remove();
            if (popup.children.length === 1) { // Only close button left
              document.body.removeChild(popup);
            }
          });
        }
      });

      const noteTitle = document.createElement('strong');
      noteTitle.innerText = note.key;
      noteTitle.style.display = 'block';
      noteTitle.style.marginBottom = '5px';
      noteTitle.style.paddingRight = '20px'; // Make room for delete button

      const noteContent = document.createElement('p');
      noteContent.innerText = note.value;
      noteContent.style.margin = '0';

      noteContainer.appendChild(deleteButton);
      noteContainer.appendChild(noteTitle);
      noteContainer.appendChild(noteContent);

      popup.appendChild(noteContainer);
    });

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.display = 'block';
    closeButton.style.margin = '10px auto 0';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(popup);
    });
    popup.appendChild(closeButton);

    // Append popup to the body
    document.body.appendChild(popup);
  });
}

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

  const addNoteButton = (button) => {
    if (button.nextElementSibling && button.nextElementSibling.classList.contains('note-button')) {
      return;
    }

    const noteButton = document.createElement('button');
    noteButton.innerText = 'Note';
    noteButton.className = 'note-button gwt-Button';

    // Add the event listener to open a popup with a note box
    noteButton.addEventListener('click', function() {
      const table = button.closest('table.matchPanel');
      if (table) {
        const noteKey = table.querySelector('div.gwt-HTML')?.textContent.trim();
        if (noteKey) {
          openNotePopup(noteKey);
        } else {
          console.warn('Note key not found');
        }
      }
    });

    button.insertAdjacentElement('afterend', noteButton);
  };

  const openNotePopup = (noteKey) => {
    // Create a simple popup container
    const popup = document.createElement('div');
    popup.className = 'note-popup';
    popup.style.position = 'fixed';
    popup.style.width = '300px';
    popup.style.height = '200px';
    popup.style.backgroundColor = '#fff';
    popup.style.border = '1px solid #ccc';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '1000';
  
    // Create a container for the 'x' button
    const popupHeader = document.createElement('div');
    popupHeader.style.display = 'flex';
    popupHeader.style.justifyContent = 'flex-end';
    popupHeader.style.marginBottom = '10px';
  
    // Create 'x' button for closing (cancel)
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;'; // Unicode for 'x'
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '20px';
    closeButton.style.width = '20px';
    closeButton.style.height = '20px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.color = '#888';
    closeButton.title = 'Close without saving';
  
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.color = '#333';
      closeButton.style.background = '#f0f0f0';
    });
  
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.color = '#888';
      closeButton.style.background = 'none';
    });
  
    closeButton.addEventListener('click', () => {
      document.body.removeChild(popup);
    });
  
    popupHeader.appendChild(closeButton);
    popup.appendChild(popupHeader);
  
    // Create the textarea for note input
    const textarea = document.createElement('textarea');
    textarea.style.width = '100%';
    textarea.style.height = '120px';
    textarea.style.marginBottom = '10px';
    textarea.placeholder = 'Enter your note here...';
    
    // Load existing note if available
    chrome.storage.local.get([`Note: ${noteKey}`], (result) => {
      textarea.value = result[`Note: ${noteKey}`] || '';
    });
  
    popup.appendChild(textarea);
  
    // Create a container for save and delete buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
  
    // Create save button
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.addEventListener('click', () => {
      const noteValue = textarea.value;
      chrome.storage.local.set({ [`Note: ${noteKey}`]: noteValue }, () => {
        console.log(`Note saved with key: ${noteKey}`);
      });
      document.body.removeChild(popup);
    });
    buttonContainer.appendChild(saveButton);
  
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete this note?`)) {
        chrome.storage.local.remove(`Note: ${noteKey}`, () => {
          console.log(`Note deleted: ${noteKey}`);
          document.body.removeChild(popup);
        });
      }
    });
    buttonContainer.appendChild(deleteButton);
  
    // Append button container to popup
    popup.appendChild(buttonContainer);
  
    // Append popup to the body
    document.body.appendChild(popup);
  };

  const observeAndAddNoteButtons = () => {
    const buttons = document.querySelectorAll('.gwt-Button.button');
    buttons.forEach(addNoteButton);
  };

  // Apply the hide logic and add note buttons initially
  hideIRTables();
  observeAndAddNoteButtons();

  // Observe only when dynamic changes might affect the IR tables or the buttons
  if (!window.hideTablesObserver) {
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length || mutation.removedNodes.length) {
          shouldReapply = true;
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.matches('.gwt-Button.button')) {
              addNoteButton(node);
            } else {
              const buttons = node.querySelectorAll('.gwt-Button.button');
              buttons.forEach(addNoteButton);
            }
          }
        });
      });
      if (shouldReapply) {
        console.log('Dynamic change detected, reapplying hide logic and adding note buttons.');
        hideIRTables(); // Reapply hiding logic
        observeAndAddNoteButtons(); // Reapply note buttons
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
