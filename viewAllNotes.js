// viewAllNotes.js
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
    overlay.style.zIndex = "999"; // Ensure it sits below the popup but above other content

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
    popup.style.zIndex = "1000"; // Above the overlay

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

      noteContainer.appendChild(deleteButton);
      noteContainer.appendChild(noteTitle);
      noteContainer.appendChild(noteText);

      popup.appendChild(noteContainer);
    });

    // Create and add the close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.display = "block";
    closeButton.style.marginTop = "10px";
    closeButton.addEventListener("click", () => {
      document.body.removeChild(popup);
      document.body.removeChild(overlay);
    });

    popup.appendChild(closeButton);

    // Add the overlay and popup to the document
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
  });
}

window.viewAllNotes = viewAllNotes;
