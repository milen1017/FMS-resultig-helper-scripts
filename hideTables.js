function hideTables() {
  // Define the function to hide tables with 'IR'
  const hideIRTables = () => {
    const matchPanelTables = document.querySelectorAll('table.matchPanel');
    matchPanelTables.forEach((table) => {
      const coverageDiv = table.querySelector('div.coverageLevel');
      if (coverageDiv && coverageDiv.textContent.trim() === 'IR') {
        table.style.display = 'none';
      }
    });
  };

  // Initially hide the tables
  hideIRTables();

  // Set up the MutationObserver to hide IR tables on DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        hideIRTables();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Store the observer in a global variable to allow for later disconnection
  window.hideTablesObserver = observer;
}

hideTables();
