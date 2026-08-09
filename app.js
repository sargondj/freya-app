/*
  Change Freya's four choices here.

  Public GitHub Pages repositories must not include copyrighted commercial
  recordings unless you have distribution rights. For a favorite song such as
  "Royals" by Lorde, use a legal source outside this public repo: for example,
  a private/local audio file supplied on the caregiver's device, or an
  authorized streaming/embed provider if its controls are simple and reliable
  enough for this cause-and-effect interface.
*/
const SOUND_BUTTONS = [
  {
    id: "blue-circle",
    label: "Blue music",
    shape: "circle",
    color: "#1479d1",
    file: "audio/blue-chime.wav",
  },
  {
    id: "green-square",
    label: "Green music",
    shape: "square",
    color: "#148f5a",
    file: "audio/green-pulse.wav",
  },
  {
    id: "yellow-diamond",
    label: "Yellow music",
    shape: "diamond",
    color: "#e3aa17",
    file: "audio/yellow-warm.wav",
  },
  {
    id: "pink-plus",
    label: "Pink music",
    shape: "plus",
    color: "#c83a83",
    file: "audio/pink-sparkle.wav",
  },
];

const buttonGrid = document.querySelector("#buttonGrid");
const stopButton = document.querySelector("#stopButton");

const audioById = new Map();
let currentAudio = null;
let currentButton = null;

function buildButtons() {
  SOUND_BUTTONS.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `music-button shape-${choice.shape}`;
    button.dataset.soundId = choice.id;
    button.style.setProperty("--button-color", choice.color);
    button.setAttribute("aria-label", choice.label);
    prepareAudio(choice);

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      showPressed(button);
      playChoice(choice, button);
    });
    button.addEventListener("pointerup", () => clearPressed(button));
    button.addEventListener("pointercancel", () => clearPressed(button));
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showPressed(button);
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

stopButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  showPressed(stopButton);
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
