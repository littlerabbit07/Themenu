const defaultFolders = [
  { id: "files", name: "Files", description: "A server container that's just a file server accessible from a web browser. Lightweight, fast, and exposed via HTTP." },
  { id: "pwas", name: "PWAs", description: "Built with HTML, CSS, and JS. Uses a service worker for offline work and a manifest for installability. Feels like a native app." },
  { id: "arduino", name: "Arduino", description: "An Arduino cat feeder using an RTC and SG90 servo to release food at set hours. Feeds automatically even when you're away." },
  { id: "blog", name: "Blog", description: "A blog made with Flask on a Linux server. Post and manage articles from your own machine. Uses Gunicorn and Nginx." },
  { id: "feeder", name: "Cat Feeder", description: "Automated feeder controlled by time, reliable when you're not home. Built for simplicity with reusable hardware." }
];

const STORAGE_KEY = "alien-terminal-folders";
const folderList = document.getElementById("folder-list");
const typewriter = document.getElementById("typewriter-text");
const title = document.getElementById("section-title");
const addButton = document.getElementById("add-folder");
const editButton = document.getElementById("edit-folder");
const renameButton = document.getElementById("rename-folder");
const deleteButton = document.getElementById("delete-folder");
const resetButton = document.getElementById("reset-folders");
const editor = document.getElementById("folder-editor");
const editTitle = document.getElementById("edit-title");
const editDescription = document.getElementById("edit-description");
const saveButton = document.getElementById("save-folder");
const cancelButton = document.getElementById("cancel-edit");
const folderStatus = document.getElementById("folder-status");
const dialog = document.getElementById("terminal-dialog");
const dialogType = document.getElementById("dialog-type");
const dialogTitle = document.getElementById("dialog-title");
const dialogFields = document.getElementById("dialog-fields");
const dialogMessage = document.getElementById("dialog-message");
const dialogPrimary = document.getElementById("dialog-primary");
const dialogCancel = document.getElementById("dialog-cancel");

let folders = loadFolders();
let activeFolderId = folders[0]?.id || null;
let typingTimer = null;
let dialogAction = null;
let dialogPreviousFocus = null;
let keyboardFolderIndex = 0;

function loadFolders() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultFolders);
  try { return JSON.parse(saved); } catch { return structuredClone(defaultFolders); }
}

function saveFolders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
}

function renderFolders() {
  folderList.innerHTML = "";
  folders.forEach((folder, index) => {
    const li = document.createElement("li");
    li.className = "tab";
    li.tabIndex = 0;
    if (folder.id === activeFolderId) li.classList.add("active");
    li.dataset.target = folder.id;
    li.textContent = folder.name;
    li.addEventListener("click", () => selectFolder(folder.id));
    li.addEventListener("focus", () => { keyboardFolderIndex = index; });
    li.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectFolder(folder.id); }
    });
    folderList.appendChild(li);
  });
}

function selectFolder(id) {
  const folder = folders.find(folder => folder.id === id);
  if (!folder) return;
  activeFolderId = id;
  const index = folders.findIndex(item => item.id === id);
  keyboardFolderIndex = index < 0 ? 0 : index;
  closeEditor();
  renderFolders();
  title.textContent = folder.name;
  typewriter.textContent = "";
  folderStatus.textContent = "ACCESS GRANTED";
  typeText(folder.description);
}

function typeText(text, i = 0) {
  clearTimeout(typingTimer);
  if (i >= text.length) return;
  typewriter.textContent += text.charAt(i);
  typingTimer = setTimeout(() => typeText(text, i + 1), 25);
}

function openDialog({ type, titleText, fields = [], message = "", primary = "EXECUTE", onSubmit }) {
  dialogPreviousFocus = document.activeElement;
  dialogAction = onSubmit;
  dialogType.textContent = type;
  dialogTitle.textContent = titleText;
  dialogMessage.textContent = message;
  dialogPrimary.textContent = primary;
  dialogFields.innerHTML = "";

  fields.forEach((field, index) => {
    const label = document.createElement("label");
    label.textContent = field.label;
    label.htmlFor = `dialog-field-${index}`;
    const input = document.createElement(field.multiline ? "textarea" : "input");
    input.id = `dialog-field-${index}`;
    input.value = field.value || "";
    input.placeholder = field.placeholder || "";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.rows = field.rows || 5;
    input.addEventListener("keydown", event => {
      if (event.key === "Enter" && !field.multiline && index === fields.length - 1) {
        event.preventDefault();
        submitDialog();
      }
      if (event.key === "Escape") closeDialog();
    });
    dialogFields.append(label, input);
  });

  dialog.classList.remove("hidden");
  folderStatus.textContent = "INPUT REQUIRED";
  const firstInput = dialogFields.querySelector("input, textarea");
  if (firstInput) firstInput.focus(); else dialogCancel.focus();
}

function submitDialog() {
  if (!dialogAction) return;
  const values = [...dialogFields.querySelectorAll("input, textarea")].map(input => input.value);
  const action = dialogAction;
  closeDialog(false);
  action(values);
}

function closeDialog(restoreFocus = true) {
  dialog.classList.add("hidden");
  dialogAction = null;
  if (activeFolderId) folderStatus.textContent = "ACCESS GRANTED";
  if (restoreFocus && dialogPreviousFocus?.focus) dialogPreviousFocus.focus();
}

dialogPrimary.addEventListener("click", submitDialog);
dialogCancel.addEventListener("click", () => closeDialog());

addButton.addEventListener("click", () => {
  openDialog({
    type: "TERMINAL INPUT",
    titleText: "NEW FOLDER",
    fields: [
      { label: "FOLDER NAME", placeholder: "Enter folder name" },
      { label: "DESCRIPTION", placeholder: "Enter folder content", multiline: true, rows: 6 }
    ],
    primary: "CREATE",
    onSubmit: ([name, description]) => {
      const cleanName = name.trim();
      if (!cleanName) return;
      const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
      folders.push({ id, name: cleanName, description: description.trim() || "New folder." });
      saveFolders();
      activeFolderId = id;
      renderFolders();
      selectFolder(id);
    }
  });
});

editButton.addEventListener("click", () => {
  const folder = folders.find(folder => folder.id === activeFolderId);
  if (!folder) return;
  editTitle.value = folder.name;
  editDescription.value = folder.description;
  editor.classList.remove("hidden");
  folderStatus.textContent = "EDIT MODE";
  editTitle.focus();
});

saveButton.addEventListener("click", () => {
  const folder = folders.find(folder => folder.id === activeFolderId);
  if (!folder) return;
  const newTitle = editTitle.value.trim();
  if (!newTitle) { editTitle.focus(); return; }
  folder.name = newTitle;
  folder.description = editDescription.value.trim() || "No description.";
  saveFolders();
  closeEditor();
  renderFolders();
  selectFolder(folder.id);
});

cancelButton.addEventListener("click", closeEditor);

function closeEditor() {
  editor.classList.add("hidden");
  if (activeFolderId) folderStatus.textContent = "ACCESS GRANTED";
}

renameButton.addEventListener("click", () => {
  const folder = folders.find(folder => folder.id === activeFolderId);
  if (!folder) return;
  openDialog({
    type: "TERMINAL INPUT",
    titleText: "RENAME FOLDER",
    fields: [{ label: "NEW NAME", value: folder.name }],
    primary: "RENAME",
    onSubmit: ([name]) => {
      if (!name.trim()) return;
      folder.name = name.trim();
      saveFolders();
      renderFolders();
      selectFolder(folder.id);
    }
  });
});

deleteButton.addEventListener("click", () => {
  const folder = folders.find(folder => folder.id === activeFolderId);
  if (!folder) return;
  openDialog({
    type: "SYSTEM WARNING",
    titleText: "DELETE FOLDER",
    message: `TARGET: "${folder.name}" — THIS ACTION CANNOT BE UNDONE.`,
    primary: "DELETE",
    onSubmit: () => {
      folders = folders.filter(item => item.id !== activeFolderId);
      activeFolderId = folders[0]?.id || null;
      saveFolders();
      renderFolders();
      if (activeFolderId) selectFolder(activeFolderId);
      else {
        title.textContent = "NO FOLDERS";
        typewriter.textContent = "Create a new folder to begin.";
        folderStatus.textContent = "NO DATA";
      }
    }
  });
});

resetButton.addEventListener("click", () => {
  openDialog({
    type: "SYSTEM WARNING",
    titleText: "RESET DATABASE",
    message: "ALL LOCAL FOLDER DATA WILL BE REPLACED BY DEFAULT DATA.",
    primary: "RESET",
    onSubmit: () => {
      folders = structuredClone(defaultFolders);
      activeFolderId = folders[0].id;
      saveFolders();
      renderFolders();
      selectFolder(activeFolderId);
    }
  });
});

// Keyboard navigation: ↑/↓ move folders, Enter selects, Tab moves controls, Esc aborts dialogs/editor.
document.addEventListener("keydown", event => {
  if (!dialog.classList.contains("hidden")) {
    if (event.key === "Escape") { event.preventDefault(); closeDialog(); }
    return;
  }

  const tag = document.activeElement?.tagName;
  const editingField = tag === "INPUT" || tag === "TEXTAREA";
  if (editingField) {
    if (event.key === "Escape") { event.preventDefault(); document.activeElement.blur(); }
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    if (!folders.length) return;
    event.preventDefault();
    keyboardFolderIndex = event.key === "ArrowDown"
      ? (keyboardFolderIndex + 1) % folders.length
      : (keyboardFolderIndex - 1 + folders.length) % folders.length;
    const folder = folders[keyboardFolderIndex];
    const item = folderList.querySelector(`[data-target="${CSS.escape(folder.id)}"]`);
    if (item) item.focus();
  }

  if (event.key === "Enter" && document.activeElement?.classList.contains("tab")) {
    event.preventDefault();
    selectFolder(document.activeElement.dataset.target);
  }

  if (event.key === "e" || event.key === "E") {
    if (!editingField) editButton.click();
  }
});

renderFolders();
if (activeFolderId) selectFolder(activeFolderId);
