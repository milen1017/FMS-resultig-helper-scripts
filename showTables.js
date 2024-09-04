// showTables.js
 function showTables() {
    console.log('showTables function called.');
  
    if (window.hideTablesObserver) {
      window.hideTablesObserver.disconnect();
      window.hideTablesObserver = null;
      console.log('MutationObserver disconnected.');      
      alert("No notes found.");

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
  window.showTables = showTables;

  