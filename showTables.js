function showTables() {
  // Disconnect the MutationObserver if it exists
  if (window.hideTablesObserver) {
    window.hideTablesObserver.disconnect();
    window.hideTablesObserver = null;
  }

  // Show all tables that were hidden
  const matchPanelTables = document.querySelectorAll('table.matchPanel');
  matchPanelTables.forEach((table) => {
    const coverageDiv = table.querySelector('div.coverageLevel');
    if (coverageDiv && coverageDiv.textContent.trim() === 'IR') {
      table.style.display = '';
    }
  });
}

showTables();
