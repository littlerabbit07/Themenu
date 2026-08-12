const defaultFolders = [
{
id: "files",
name: "Files",
description:
"A server container that's just a file server accessible from a web browser. Lightweight, fast, and exposed via HTTP."
},
{
id: "pwas",
name: "PWAs",
description:
"Built with HTML, CSS, and JS. Uses a service worker for offline work and a manifest for installability. Feels like a native app."
},
{
id: "arduino",
name: "Arduino",
description:
"An Arduino cat feeder using an RTC and SG90 servo to release food at set hours. Feeds automatically even when you're away."
},
{
id: "blog",
name: "Blog",
description:
"A blog made with Flask on a Linux server. Post and manage articles from your own machine. Uses Gunicorn and Nginx."
},
{
id: "feeder",
name: "Cat Feeder",
description:
"Automated feeder controlled by time, reliable when you're not home. Built for simplicity with reusable hardware."
}
];

const STORAGE_KEY = "alien-terminal-folders";

const folderList = document.getElementById("folder-list");
const typewriter = document.getElementById("typewriter-text");
const title = document.getElementById("section-title");

const addButton = document.getElementById("add-folder");
const renameButton = document.getElementById("rename-folder");
const deleteButton = document.getElementById("delete-folder");
const resetButton = document.getElementById("reset-folders");

let folders = loadFolders();
let activeFolderId = folders[0]?.id || null;

// --------------------------------------------------
// STORAGE
// --------------------------------------------------

function loadFolders() {
const saved = localStorage.getItem(STORAGE_KEY);

if (!saved) {
return structuredClone(defaultFolders);
}

try {
return JSON.parse(saved);
} catch {
return structuredClone(defaultFolders);
}
}

function saveFolders() {
localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
}

// --------------------------------------------------
// RENDER FOLDERS
// --------------------------------------------------

function renderFolders() {
folderList.innerHTML = "";

folders.forEach(folder => {
const li = document.createElement("li");

```
li.className = "tab";

if (folder.id === activeFolderId) {
  li.classList.add("active");
}

li.dataset.target = folder.id;
li.textContent = folder.name;

li.addEventListener("click", () => {
  selectFolder(folder.id);
});

folderList.appendChild(li);
```

});
}

// --------------------------------------------------
// SELECT FOLDER
// --------------------------------------------------

function selectFolder(id) {
const folder = folders.find(folder => folder.id === id);

if (!folder) return;

activeFolderId = id;

renderFolders();

title.textContent = folder.name;

typewriter.textContent = "";

typeText(folder.description);
}

// --------------------------------------------------
// TYPEWRITER
// --------------------------------------------------

let typingTimer = null;

function typeText(text, i = 0) {
clearTimeout(typingTimer);

if (i >= text.length) return;

typewriter.textContent += text.charAt(i);

typingTimer = setTimeout(() => {
typeText(text, i + 1);
}, 25);
}

// --------------------------------------------------
// ADD FOLDER
// --------------------------------------------------

addButton.addEventListener("click", () => {
const name = prompt("NEW FOLDER:");

if (!name || !name.trim()) return;

const cleanName = name.trim();

const id =
cleanName
.toLowerCase()
.replace(/[^a-z0-9]+/g, "-")
.replace(/^-|-$/g, "") +
"-" +
Date.now();

const description =
prompt("DESCRIPTION:", "New folder.") || "New folder.";

const newFolder = {
id,
name: cleanName,
description
};

folders.push(newFolder);

saveFolders();

activeFolderId = id;

renderFolders();
selectFolder(id);
});

// --------------------------------------------------
// RENAME FOLDER
// --------------------------------------------------

renameButton.addEventListener("click", () => {
const folder = folders.find(folder => folder.id === activeFolderId);

if (!folder) return;

const newName = prompt("RENAME FOLDER:", folder.name);

if (!newName || !newName.trim()) return;

folder.name = newName.trim();

saveFolders();

renderFolders();
selectFolder(folder.id);
});

// --------------------------------------------------
// DELETE FOLDER
// --------------------------------------------------

deleteButton.addEventListener("click", () => {
const folder = folders.find(folder => folder.id === activeFolderId);

if (!folder) return;

const confirmed = confirm(
`DELETE "${folder.name}"?`
);

if (!confirmed) return;

folders = folders.filter(folder => folder.id !== activeFolderId);

activeFolderId = folders[0]?.id || null;

saveFolders();

renderFolders();

if (activeFolderId) {
selectFolder(activeFolderId);
} else {
title.textContent = "NO FOLDERS";
typewriter.textContent = "Create a new folder to begin.";
}
});

// --------------------------------------------------
// RESET
// --------------------------------------------------

resetButton.addEventListener("click", () => {
const confirmed = confirm(
"RESET ALL FOLDERS TO DEFAULT?"
);

if (!confirmed) return;

folders = structuredClone(defaultFolders);

activeFolderId = folders[0].id;

saveFolders();

renderFolders();
selectFolder(activeFolderId);
});

// --------------------------------------------------
// INITIALIZE
// --------------------------------------------------

renderFolders();

if (activeFolderId) {
selectFolder(activeFolderId);
}
