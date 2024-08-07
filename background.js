let isActive = false;

chrome.runtime.onInstalled.addListener(() => {
  // Create the context menu item
  chrome.contextMenus.create({
    id: "toggleHideTables",
    title: "Toggle IR games",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggleHideTables") {
    isActive = !isActive;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleHideTables,
      args: [isActive]
    });
  }
});

function toggleHideTables(isActive) {
  if (isActive) {
    (function() {
      function hideTables() {
        var matchPanelTables = document.querySelectorAll('table.matchPanel');
        matchPanelTables.forEach(function(table) {
          var coverageDiv = table.querySelector('div.coverageLevel');
          if (coverageDiv && coverageDiv.textContent.trim() === 'IR') {
            table.style.display = 'none';
          }
        });
      }
      hideTables();

      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length) {
            hideTables();
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      window.hideTablesObserver = observer;

      // CSS styles for the note box
      const style = document.createElement('style');
      style.textContent = `
          .scrapedSourcesPanel {
              position: relative;
          }
   
          .note-box {
              display: none;
              position: absolute;
              width: 200px;
              margin-top: 5px;
              background-color: white;
              border: 1px solid #ccc;
              padding: 5px;
              z-index: 1000;
          }
      `;
      document.head.appendChild(style);

      // Function to add note box to the divs
      function addNoteBoxToDivs() {
          const divs = document.querySelectorAll('.scrapedSourcesPanel');
          if (!divs.length) return;

          // Create a container for the note
          const noteBox = document.createElement('div');
          noteBox.className = 'note-box';

          // Create a textbox for entering the note
          const textBox = document.createElement('input');
          textBox.type = 'text';
          textBox.placeholder = 'Add a note...';

          // Append the textbox to the note container
          noteBox.appendChild(textBox);
          document.body.appendChild(noteBox);

          // Add event listeners to the divs
          divs.forEach((div) => {
              div.addEventListener('click', function(event) {
                  event.stopPropagation(); // Prevent click event from propagating
                  const rect = div.getBoundingClientRect();
                  noteBox.style.top = `${window.scrollY + rect.bottom}px`;
                  noteBox.style.left = `${rect.left}px`;
                  noteBox.style.display = 'block';

                  // Load existing note if available
                  if (div.dataset.note) {
                      textBox.value = div.dataset.note;
                  } else {
                      textBox.value = '';
                  }

                  // Save the note to the div on change
                  textBox.onchange = function() {
                      div.dataset.note = textBox.value;
                  };
              });

              div.addEventListener('dblclick', function() {
                  noteBox.style.display = 'none';
              });
          });

          // Hide the note box when clicking outside
          document.addEventListener('click', function() {
              noteBox.style.display = 'none';
          });

          noteBox.addEventListener('click', function(event) {
              event.stopPropagation(); // Prevent hiding the note box when clicking inside it
          });
      }

      // Run the function to add note box
      addNoteBoxToDivs();
    })();
  } else {
    // Stop the MutationObserver if it exists
    if (window.hideTablesObserver) {
      window.hideTablesObserver.disconnect();
      window.hideTablesObserver = null;
    }

    // Revert the changes made by the script
    var matchPanelTables = document.querySelectorAll('table.matchPanel');
    matchPanelTables.forEach(function(table) {
      var coverageDiv = table.querySelector('div.coverageLevel');
      if (coverageDiv && coverageDiv.textContent.trim() === 'IR') {
        table.style.display = '';
      }
    });
  }
}
