/*
  Change Freya's four choices here.

  Public GitHub Pages repositories must not include copyrighted commercial
  recordings unless you have distribution rights. The purple button can use a
  private audio file selected on an individual phone or tablet by opening the
  app with ?setup=1. That file is saved only in that browser's private local
  storage and is not uploaded to GitHub.
*/
const SOUND_BUTTONS = [
  {
    id: "blue-whale",
    label: "Whale sound",
    color: "#1479d1",
    file: "audio/blue-whale.wav?v=natural-2",
    icon: "icons/whale.svg?v=representational-2",
  },
  {
    id: "green-wind-chimes",
    label: "Wind chimes",
    color: "#148f5a",
    file: "audio/green-wind-chimes.wav?v=natural-2",
    icon: "icons/wind-chimes.svg?v=representational-2",
  },
  {
    id: "yellow-owl",
    label: "Owl hoot",
    color: "#e3aa17",
    file: "audio/yellow-owl.wav?v=natural-2",
    icon: "icons/owl.svg?v=representational-2",
  },
  {
    id: "purple-crown",
    label: "Purple crown music",
    color: "#8f4fd1",
    file: "audio/pink-sparkle.wav",
    icon: "icons/crown.svg",
    localAudioSlot: true,
  },
];

const LOCAL_AUDIO_BUTTON_ID = "purple-crown";
const LOCAL_AUDIO_DB = "freya-music-button-audio";
const LOCAL_AUDIO_STORE = "private-audio";
const LOCAL_AUDIO_KEY = "purple-button";

const buttonGrid = document.querySelector("#buttonGrid");
const stopButton = document.querySelector("#stopButton");
const setupPanel = document.querySelector("#setupPanel");
const localAudioInput = document.querySelector("#localAudioInput");
const clearLocalAudioButton = document.querySelector("#clearLocalAudio");
const setupStatus = document.querySelector("#setupStatus");

const audioById = new Map();
let currentAudio = null;
let currentButton = null;
let localAudioObjectUrl = null;
let localAudioName = "";
let orientationLockRequested = false;

function buildButtons() {
  SOUND_BUTTONS.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "music-button";
    button.dataset.soundId = choice.id;
    button.style.setProperty("--button-color", choice.color);
    button.setAttribute("aria-label", choice.label);
    button.append(createButtonIcon(choice));
    prepareAudio(choice);

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      showPressed(button);
      requestPortraitLock();
      playChoice(choice, button);
    });
    button.addEventListener("pointerup", () => clearPressed(button));
    button.addEventListener("pointercancel", () => clearPressed(button));
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showPressed(button);
        requestPortraitLock();
        playChoice(choice, button);
      }
    });
    button.addEventListener("keyup", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        clearPressed(button);
      }
    });

    buttonGrid.append(button);
  });
}

function createButtonIcon(choice) {
  const icon = document.createElement("img");
  icon.className = "button-icon";
  icon.src = choice.icon;
  icon.alt = "";
  icon.draggable = false;
  return icon;
}

function playChoice(choice, button) {
  stopPlayback();

  const audio = audioById.get(choice.id);
  audio.currentTime = 0;

  currentAudio = audio;
  currentButton = button;
  button.classList.add("is-playing");

  audio.onended = () => clearPlayingStateFor(audio);
  audio.onerror = () => clearPlayingStateFor(audio);

  const playPromise = audio.play();
  if (playPromise) {
    playPromise.catch(() => clearPlayingStateFor(audio));
  }
}

function prepareAudio(choice) {
  const audio = new Audio(choice.file);
  audio.preload = "auto";
  audioById.set(choice.id, audio);
}

function stopPlayback() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  clearPlayingState();
}

function clearPlayingState() {
  if (currentButton) {
    currentButton.classList.remove("is-playing");
  }

  currentAudio = null;
  currentButton = null;
}

function clearPlayingStateFor(audio) {
  if (currentAudio === audio) {
    clearPlayingState();
  }
}

function showPressed(button) {
  button.classList.add("is-pressed");
}

function clearPressed(button) {
  button.classList.remove("is-pressed");
}

function requestPortraitLock() {
  if (orientationLockRequested || !screen.orientation?.lock) {
    return;
  }

  orientationLockRequested = true;
  screen.orientation.lock("portrait-primary").catch(() => {
    // Many mobile browsers reject orientation locking in normal tabs.
  });
}

function setupModeEnabled() {
  const params = new URLSearchParams(window.location.search);
  return params.has("setup") || window.location.hash === "#setup";
}

async function loadLocalAudio() {
  try {
    const saved = await readLocalAudioRecord();
    if (saved?.blob) {
      useLocalAudioBlob(saved.blob, saved.name || "private audio file");
    }
  } catch (error) {
    updateSetupStatus("Private audio could not be loaded on this device.");
  }
}

function useLocalAudioBlob(blob, name) {
  if (localAudioObjectUrl) {
    URL.revokeObjectURL(localAudioObjectUrl);
  }

  localAudioObjectUrl = URL.createObjectURL(blob);
  localAudioName = name;

  const audio = new Audio(localAudioObjectUrl);
  audio.preload = "auto";
  audioById.set(LOCAL_AUDIO_BUTTON_ID, audio);

  updateSetupStatus(`Purple button is using private audio: ${localAudioName}`);
}

function enableCaregiverSetup() {
  if (!setupModeEnabled()) {
    return;
  }

  setupPanel.hidden = false;
  updateSetupStatus(localAudioName ? `Purple button is using private audio: ${localAudioName}` : "Purple button is using the demo sound.");
}

localAudioInput.addEventListener("change", async () => {
  const file = localAudioInput.files && localAudioInput.files[0];
  if (!file) {
    return;
  }

  try {
    await confirmPlayableAudio(file);
    await saveLocalAudioRecord(file);
    useLocalAudioBlob(file, file.name);
  } catch (error) {
    updateSetupStatus(error.message || "This browser could not save that audio file. Try a smaller MP3, M4A, AAC, or WAV file.");
  }
});

clearLocalAudioButton.addEventListener("click", async () => {
  stopPlayback();
  if (localAudioObjectUrl) {
    URL.revokeObjectURL(localAudioObjectUrl);
    localAudioObjectUrl = null;
  }

  try {
    await deleteLocalAudioRecord();
  } finally {
    const purpleChoice = SOUND_BUTTONS.find((choice) => choice.id === LOCAL_AUDIO_BUTTON_ID);
    prepareAudio(purpleChoice);
    localAudioName = "";
    updateSetupStatus("Purple button is using the demo sound.");
  }
});

function confirmPlayableAudio(file) {
  return new Promise((resolve, reject) => {
    const testUrl = URL.createObjectURL(file);
    const audio = new Audio();
    const cleanup = () => URL.revokeObjectURL(testUrl);

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error("This browser could not read that audio file. Try MP3, M4A, AAC, or WAV."));
    };
    audio.src = testUrl;
  });
}

function updateSetupStatus(message) {
  if (setupStatus) {
    setupStatus.textContent = message;
  }
}

function openLocalAudioDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_AUDIO_DB, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(LOCAL_AUDIO_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readLocalAudioRecord() {
  const db = await openLocalAudioDb();
  return runLocalAudioTransaction(db, "readonly", (store) => store.get(LOCAL_AUDIO_KEY));
}

async function saveLocalAudioRecord(file) {
  const db = await openLocalAudioDb();
  const record = {
    name: file.name,
    type: file.type,
    blob: file,
    savedAt: new Date().toISOString(),
  };

  return runLocalAudioTransaction(db, "readwrite", (store) => store.put(record, LOCAL_AUDIO_KEY));
}

async function deleteLocalAudioRecord() {
  const db = await openLocalAudioDb();
  return runLocalAudioTransaction(db, "readwrite", (store) => store.delete(LOCAL_AUDIO_KEY));
}

function runLocalAudioTransaction(db, mode, action) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(LOCAL_AUDIO_STORE, mode);
    const store = transaction.objectStore(LOCAL_AUDIO_STORE);
    const request = action(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

stopButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  showPressed(stopButton);
  requestPortraitLock();
  stopPlayback();
});
stopButton.addEventListener("pointerup", () => {
  clearPressed(stopButton);
});
stopButton.addEventListener("pointercancel", () => clearPressed(stopButton));
stopButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showPressed(stopButton);
    requestPortraitLock();
    stopPlayback();
  }
});
stopButton.addEventListener("keyup", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    clearPressed(stopButton);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopPlayback();
  }
});

buildButtons();
loadLocalAudio().then(enableCaregiverSetup);
