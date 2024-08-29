function addNoteButton(button) {
  if (button.textContent.trim() !== "Open") {
    return;
  }

  if (
    button.nextElementSibling &&
    button.nextElementSibling.classList.contains("note-button")
  ) {
    return;
  }

  const noteButton = document.createElement("button");
  noteButton.innerText = "Note";
  noteButton.className = "note-button gwt-Button";

  const buttonStyles = window.getComputedStyle(button);
  noteButton.style.width = buttonStyles.width;
  noteButton.style.height = buttonStyles.height;
  noteButton.style.padding = buttonStyles.padding;
  noteButton.style.fontSize = buttonStyles.fontSize;
  noteButton.style.lineHeight = buttonStyles.lineHeight;

  noteButton.style.marginLeft = "10px"; // Add left margin, adjust as needed
  noteButton.style.marginTop = "5px"; // Add top margin, adjust as needed

  const table = button.closest("table.matchPanel");
  const noteKey = table
    ? table.querySelector("div.gwt-HTML")?.textContent.trim()
    : null;

  // Add the event listener to open a popup with a note box
  noteButton.addEventListener("click", function () {
    if (noteKey) {
      openNotePopup(noteKey);
    } else {
      console.warn("Note key not found");
    }
  });

  // Add hover functionality
  noteButton.addEventListener("mouseenter", function () {
    if (noteKey) {
      showNotePreview(noteKey, noteButton);
    }
  });

  button.insertAdjacentElement("afterend", noteButton);
}

function openNotePopup(noteKey) {
  const popup = document.createElement("div");
  popup.className = "note-popup";
  popup.style.position = "fixed";
  popup.style.width = "300px";
  popup.style.height = "200px";
  popup.style.backgroundColor = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "20px";
  popup.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.1)";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.zIndex = "1000";

  const popupHeader = document.createElement("div");
  popupHeader.style.display = "flex";
  popupHeader.style.justifyContent = "flex-end";
  popupHeader.style.marginBottom = "10px";

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.style.border = "none";
  closeButton.style.background = "none";
  closeButton.style.fontSize = "20px";
  closeButton.style.cursor = "pointer";
  closeButton.style.padding = "0";
  closeButton.style.lineHeight = "20px";
  closeButton.style.width = "20px";
  closeButton.style.height = "20px";
  closeButton.style.borderRadius = "50%";
  closeButton.style.color = "#888";
  closeButton.title = "Close without saving";

  closeButton.addEventListener("mouseenter", () => {
    closeButton.style.color = "#333";
    closeButton.style.background = "#f0f0f0";
  });

  closeButton.addEventListener("mouseleave", () => {
    closeButton.style.color = "#888";
    closeButton.style.background = "none";
  });

  closeButton.addEventListener("click", () => {
    document.body.removeChild(popup);
  });

  popupHeader.appendChild(closeButton);
  popup.appendChild(popupHeader);

  const textarea = document.createElement("textarea");
  textarea.style.width = "100%";
  textarea.style.height = "120px";
  textarea.style.marginBottom = "10px";
  textarea.placeholder = "Enter your note here...";

  chrome.storage.local.get([`Note: ${noteKey}`], (result) => {
    textarea.value = result[`Note: ${noteKey}`] || "";
  });

  popup.appendChild(textarea);

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";

  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.addEventListener("click", () => {
    const noteValue = textarea.value;
    chrome.storage.local.set({ [`Note: ${noteKey}`]: noteValue }, () => {
      console.log(`Note saved with key: ${noteKey}`);
    });
    document.body.removeChild(popup);
  });
  buttonContainer.appendChild(saveButton);

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", () => {
    if (confirm(`Are you sure you want to delete this note?`)) {
      chrome.storage.local.remove(`Note: ${noteKey}`, () => {
        console.log(`Note deleted: ${noteKey}`);
        document.body.removeChild(popup);
      });
    }
  });
  buttonContainer.appendChild(deleteButton);

  popup.appendChild(buttonContainer);

  document.body.appendChild(popup);
}

function observeAndAddNoteButtons() {
  const buttons = document.querySelectorAll(".gwt-Button.button");
  buttons.forEach(addNoteButton);
}

function showNotePreview(noteKey, button) {
  chrome.storage.local.get([`Note: ${noteKey}`], (result) => {
    const noteContent = result[`Note: ${noteKey}`];

    const preview = document.createElement('div');
    preview.className = 'note-preview';
    preview.style.position = 'absolute';
    preview.style.backgroundColor = '#fff';
    preview.style.border = '1px solid #ccc';
    preview.style.padding = '10px';
    preview.style.borderRadius = '5px';
    preview.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    preview.style.zIndex = '1000';
    preview.style.maxWidth = '200px';
    preview.style.wordWrap = 'break-word';
    preview.textContent = noteContent.substring(0, 100) + (noteContent.length > 100 ? '...' : '');

    const rect = button.getBoundingClientRect();
    preview.style.top = `${rect.bottom + window.scrollY + 5}px`;
    preview.style.left = `${rect.left + window.scrollX}px`;

    document.body.appendChild(preview);

    button.addEventListener('mouseleave', () => {
      // Add a delay of 500 milliseconds (0.5 seconds) before removing the preview
      setTimeout(() => {
        document.body.removeChild(preview);
      }, 500); // Adjust the delay time as needed
    }, { once: true });
  });
}






window.observeAndAddNoteButtons = observeAndAddNoteButtons;
window.addNoteButton = addNoteButton;
