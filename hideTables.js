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
  
    if (!window.hideTablesObserver) {
      const observer = new MutationObserver((mutations) => {
          let shouldReapply = false;
          mutations.forEach((mutation) => {
              if (mutation.addedNodes.length || mutation.removedNodes.length) {
                  shouldReapply = true;
              }
              mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === 1) {
                      // Existing logic
                      if (node.matches('.gwt-Button.button')) {
                          addNoteButton(node); // from notes.js
                      } else {
                          const buttons = node.querySelectorAll('.gwt-Button.button');
                          buttons.forEach(addNoteButton); // from notes.js
                      }
  
                      // New logic to add button for extracting and redirecting
                      if (node.matches('.gwt-Label.panelHeader')) {
                          window.addButtonAndSetupFunction(); // Run the function when the relevant div is added
                      } else {
                          const headers = node.querySelectorAll('.gwt-Label.panelHeader');
                          headers.forEach(() => window.addButtonAndSetupFunction()); // Run the function for each relevant div
                      }
                  }
              });
          });
          if (shouldReapply) {
              console.log('Dynamic change detected, reapplying hide logic and adding note buttons.');
              hideIRTables();
              observeAndAddNoteButtons(); // from notes.js
          }
      });
  
      observer.observe(document.body, {
          childList: true,
          subtree: true,
      });
  
      window.hideTablesObserver = observer;
      console.log('MutationObserver started.');
  }
  
  }
  
  window.hideTables = hideTables;
  