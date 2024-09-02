// checkForMarkets.js

window.extractNumberAndRedirect = function() {
    const div = document.querySelector('.gwt-Label.panelHeader');
    if (div) {
        const textContent = div.textContent;
        const match = textContent.match(/\((\d+)\)/);

        if (match && match[1]) {
            const extractedNumber = match[1];
            const secondPageUrl = `https://operationalwebservices.app.production.sbmi.geniussports.com/emtools/Pages/Resulting/event-tracker.aspx?eventId=${extractedNumber}`;
            window.location.href = secondPageUrl;
        } else {
            console.error("No number found in the div text content.");
        }
    } else {
        console.error("Div with the class 'gwt-Label panelHeader' not found.");
    }
}


window.addButtonAndSetupFunction = function () {
  // Locate the div where you want to add the button
  const panelHeader = document.querySelector('.gwt-Label.panelHeader');
  if (!panelHeader) {
      console.error("Panel header not found.");
      return;
  }

  // Create a new button
  const button = document.createElement('button');
  button.textContent = 'Open in Event Tracker';
  button.style.marginLeft = 'auto'; // Push the button to the right
  button.style.float = 'right'; // Float the button to the right

  // Style the panelHeader to ensure it behaves like a flex container
  panelHeader.style.display = 'flex';
  panelHeader.style.alignItems = 'center'; // Vertically align the items
  panelHeader.style.justifyContent = 'flex-end'; // Push all children to the right

  // Append the button to the panel header
  panelHeader.appendChild(button);

  // Add click event to the button
  button.addEventListener('click', () => {
      const extractedNumber = extractNumberFromText(panelHeader.textContent);
      if (extractedNumber) {
          const url = `https://operationalwebservices.app.production.sbmi.geniussports.com/emtools/Pages/Resulting/event-tracker.aspx?eventId=${extractedNumber}`;
          window.open(url, '_blank'); // Opens the URL in a new tab
          console.log(`Opening Event Tracker in new tab with eventId: ${extractedNumber}`);
      } else {
          console.error("No event ID found in the text.");
      }
  });
}

function extractNumberFromText(text) {
 const match = text.match(/\((\d+)\)/);
 return match ? match[1] : null;
};
