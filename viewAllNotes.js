function viewAllNotes() {
  console.log("viewAllNotes function called.");

  chrome.storage.local.get(null, (items) => {
    const notes = [];
    for (const [key, value] of Object.entries(items)) {
      if (key.startsWith("Note: ")) {
        notes.push({ key: key.replace("Note: ", ""), value });
      }
    }

    if (notes.length === 0) {
      alert("No notes found.");
      return;
    }

    // Create a dimming background overlay
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.zIndex = "999";

    // Create the popup container
    const popup = document.createElement("div");
    popup.className = "notes-popup";
    popup.style.position = "fixed";
    popup.style.width = "700px";
    popup.style.height = "500px";
    popup.style.backgroundColor = "#fff";
    popup.style.border = "1px solid #ccc";
    popup.style.padding = "20px";
    popup.style.overflowY = "scroll";
    popup.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.1)";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.zIndex = "1000";

    // Populate the popup with notes
    notes.forEach((note) => {
      const noteContainer = document.createElement("div");
      noteContainer.style.marginBottom = "15px";
      noteContainer.style.position = "relative";
      noteContainer.style.backgroundColor = "#f9f9f9";
      noteContainer.style.padding = "10px";
      noteContainer.style.borderRadius = "5px";

      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = "&times;";
      deleteButton.style.position = "absolute";
      deleteButton.style.top = "5px";
      deleteButton.style.right = "5px";
      deleteButton.style.border = "none";
      deleteButton.style.background = "none";
      deleteButton.style.fontSize = "18px";
      deleteButton.style.cursor = "pointer";
      deleteButton.style.color = "#888";
      deleteButton.title = "Delete this note";

      deleteButton.addEventListener("click", () => {
        if (
          confirm(`Are you sure you want to delete the note for ${note.key}?`)
        ) {
          chrome.storage.local.remove(`Note: ${note.key}`, () => {
            console.log(`Note deleted: ${note.key}`);
            popup.removeChild(noteContainer);
          });
        }
      });

      const noteTitle = document.createElement("strong");
      noteTitle.textContent = note.key;
      noteTitle.style.display = "block";
      noteTitle.style.marginBottom = "5px";

      const noteText = document.createElement("p");
      noteText.textContent = note.value;

      // Create a container for the buttons
      const buttonContainer = document.createElement("div");
      buttonContainer.style.display = "flex";
      buttonContainer.style.justifyContent = "flex-start";
      buttonContainer.style.marginTop = "10px";

      // Create and add the "Send to Slack" button
      const slackButton = createSendButton("Send to Slack", "#4A154B", () => sendToSlack(note.key, note.value));

      // Create and add the "Send to Discord" button
      const discordButton = createSendButton("Send to Discord", "#7289DA", () => sendToDiscord(note.key, note.value));

      // Add buttons to the button container
      buttonContainer.appendChild(discordButton);
      // buttonContainer.appendChild(slackButton); todo

      noteContainer.appendChild(deleteButton);
      noteContainer.appendChild(noteTitle);
      noteContainer.appendChild(noteText);
      noteContainer.appendChild(buttonContainer);

      popup.appendChild(noteContainer);
    });

    // Add the overlay and popup to the document
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // Add event listener to the overlay to close the popup when clicked
    overlay.addEventListener("click", () => {
      document.body.removeChild(popup);
      document.body.removeChild(overlay);
    });

    // Prevent clicks inside the popup from closing it
    popup.addEventListener("click", (event) => {
      event.stopPropagation();
    });

// Create and add the "Copy All Notes" button at the bottom center of the popup
const copyButton = document.createElement("button");
copyButton.innerText = "Copy All Notes";
copyButton.style.position = "absolute";
copyButton.style.bottom = "10px";
copyButton.style.left = "50%";
copyButton.style.transform = "translateX(-50%)";
copyButton.style.padding = "10px 20px";
copyButton.style.backgroundColor = "#007bff";
copyButton.style.color = "white";
copyButton.style.border = "none";
copyButton.style.borderRadius = "4px";
copyButton.style.cursor = "pointer";

// Copy all notes to clipboard when the button is clicked
copyButton.addEventListener("click", () => {
  const allNotesText = notes.map(note => `${note.key}\n${note.value}`).join("\n\n");

  navigator.clipboard.writeText(allNotesText).then(() => {
    // Provide visual feedback
    copyButton.innerText = "Copied!";
    copyButton.style.backgroundColor = "#28a745"; // Green background
    copyButton.style.color = "white";

    // Revert back to the original state after 2 seconds
    setTimeout(() => {
      copyButton.innerText = "Copy All Notes";
      copyButton.style.backgroundColor = "#007bff"; // Original blue background
      copyButton.style.color = "white";
    }, 300);
  }).catch((error) => {
    console.error('Error copying notes to clipboard:', error);
    alert("Failed to copy notes to the clipboard.");
  });
});

popup.appendChild(copyButton);

  });
}

// Helper function to create send buttons
function createSendButton(text, color, onClick) {
  const button = document.createElement("button");
  button.innerText = text;
  button.style.padding = "5px 10px";
  button.style.backgroundColor = color;
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";
  button.style.marginRight = "10px";
  button.addEventListener("click", onClick);
  return button;
}

// Function to send a note to Slack
function sendToSlack(noteKey, noteValue) {
  // Replace 'YOUR_SLACK_WEBHOOK_URL' with your actual Slack webhook URL
  const webhookUrl = 'YOUR_SLACK_WEBHOOK_URL';

  const payload = {
    text: `*Note: ${noteKey}*\n${noteValue}`
  };

  sendWebhook(webhookUrl, payload, 'Slack');
}

// Function to send a note to Discord
function sendToDiscord(noteKey, noteValue) {
  chrome.storage.local.get('discordWebhookUrl', (result) => {
    const webhookUrl = result.discordWebhookUrl;

    if (!webhookUrl) {
      alert('Discord webhook URL is not set. Please set it in the extension options.');
      return;
    }

    const payload = {
      content: `**Note: ${noteKey}**\n${noteValue}`
    };

    sendWebhook(webhookUrl, payload, 'Discord');
  });
}

// Generic function to send webhooks
function sendWebhook(url, payload, platform) {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (response.ok) {
      alert(`Note sent to ${platform} successfully!`);
    } else {
      alert(`Failed to send note to ${platform}. Please try again.`);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert(`An error occurred while sending the note to ${platform}.`);
  });
}

// Function to set the Discord webhook URL (call this when setting up the extension)
function setDiscordWebhookUrl(url) {
  chrome.storage.local.set({ discordWebhookUrl: url }, () => {
    console.log('Discord webhook URL has been set.');
  });
}

// Call this function to set the Discord webhook URL (you can do this in your extension's options page or background script)
setDiscordWebhookUrl('https://discord.com/api/webhooks/1280899775356735489/pKC1HlfWsEaXcrZ9DdYshb1TRdj75CXP4lpAkCXBGRsTsrT6_r3LEtHWLBj_xIPX8mz3');

window.viewAllNotes = viewAllNotes;
