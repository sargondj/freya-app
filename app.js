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
    file: "audio/monterey-humpback-song.mp3?v=mbari-1",
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

const LOCAL_AUDIO_DB = "freya-music-button-audio";
const LOCAL_AUDIO_STORE = "private-audio";
const LOCAL_AUDIO_SLOTS = [
  { id: "purple-crown", key: "purple-button", label: "Purple", fallback: "demo sound", inputId: "localAudioInput", clearId: "clearLocalAudio", statusId: "setupStatus" },
  { id: "yellow-owl", key: "owl-button", label: "Owl", fallback: "public owl sound", inputId: "owlAudioInput", clearId: "clearOwlAudio", statusId: "owlSetupStatus" },
];

const buttonGrid = document.querySelector("#buttonGrid");
const stopButton = document.querySelector("#stopButton");
const setupPanel = document.querySelector("#setupPanel");
const audioById = new Map();
let currentAudio = null;
let currentButton = null;
const localAudioState = new Map();
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
  for (const slot of LOCAL_AUDIO_SLOTS) {
    try {
      const saved = await readLocalAudioRecord(slot.key);
      if (saved?.blob) {
        useLocalAudioBlob(slot, saved.blob, saved.name || "private audio file");
      }
    } catch (error) {
      updateSetupStatus(slot, "Private audio could not be loaded on this device.");
    }
  }
}

function useLocalAudioBlob(slot, blob, name) {
  const previous = localAudioState.get(slot.id);
  if (previous?.objectUrl) {
    URL.revokeObjectURL(previous.objectUrl);
  }

  const objectUrl = URL.createObjectURL(blob);
  localAudioState.set(slot.id, { objectUrl, name });

  const audio = new Audio(objectUrl);
  audio.preload = "auto";
  audioById.set(slot.id, audio);

  updateSetupStatus(slot, `${slot.label} button is using private audio: ${name}`);
}

function enableCaregiverSetup() {
  if (!setupModeEnabled()) {
    return;
  }

  setupPanel.hidden = false;
  for (const slot of LOCAL_AUDIO_SLOTS) {
    const name = localAudioState.get(slot.id)?.name;
    updateSetupStatus(slot, name ? `${slot.label} button is using private audio: ${name}` : `${slot.label} button is using the ${slot.fallback}.`);
  }
}

for (const slot of LOCAL_AUDIO_SLOTS) {
  const input = document.getElementById(slot.inputId);
  const clearButton = document.getElementById(slot.clearId);

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      await confirmPlayableAudio(file);
      await saveLocalAudioRecord(slot.key, file);
      stopPlayback();
      useLocalAudioBlob(slot, file, file.name);
    } catch (error) {
      updateSetupStatus(slot, error.message || "This browser could not save that audio file. Try a smaller MP3, M4A, AAC, or WAV file.");
    }
  });

  clearButton.addEventListener("click", async () => {
    try {
      await deleteLocalAudioRecord(slot.key);
      stopPlayback();
      const previous = localAudioState.get(slot.id);
      if (previous?.objectUrl) {
        URL.revokeObjectURL(previous.objectUrl);
      }
      localAudioState.delete(slot.id);
      prepareAudio(SOUND_BUTTONS.find((choice) => choice.id === slot.id));
      input.value = "";
      updateSetupStatus(slot, `${slot.label} button is using the ${slot.fallback}.`);
    } catch (error) {
      updateSetupStatus(slot, "Private audio could not be removed on this device.");
    }
  });
}

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

function updateSetupStatus(slot, message) {
  document.getElementById(slot.statusId).textContent = message;
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

async function readLocalAudioRecord(key) {
  const db = await openLocalAudioDb();
  return runLocalAudioTransaction(db, "readonly", (store) => store.get(key));
}

async function saveLocalAudioRecord(key, file) {
  const db = await openLocalAudioDb();
  const record = {
    name: file.name,
    type: file.type,
    blob: file,
    savedAt: new Date().toISOString(),
  };

  return runLocalAudioTransaction(db, "readwrite", (store) => store.put(record, key));
}

async function deleteLocalAudioRecord(key) {
  const db = await openLocalAudioDb();
  return runLocalAudioTransaction(db, "readwrite", (store) => store.delete(key));
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
