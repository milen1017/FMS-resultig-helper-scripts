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
              if (node.matches('.gwt-Button.button')) {
                addNoteButton(node); // from notes.js
              } else {
                const buttons = node.querySelectorAll('.gwt-Button.button');
                buttons.forEach(addNoteButton); // from notes.js
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
  