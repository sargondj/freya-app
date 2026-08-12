# Freya Music Buttons

A small static GitHub Pages app built as an accessible cause-and-effect music interface.

## Files

- `index.html` contains the app shell.
- `styles.css` defines the large touch targets and responsive layout.
- `app.js` contains the obvious `SOUND_BUTTONS` configuration section for labels, colors, shapes, and audio filenames.
- `manifest.webmanifest` asks supported installed web-app surfaces to keep the app portrait-oriented.
- `favicon.svg` is a four-color app icon using the button colors.
- `audio/` contains original generated demo WAV files for public use.
- `tools/generate_demo_audio.py` recreates the demo audio files.

## Changing Public Demo Sounds

Replace files in `audio/`, then update the `file` values in `app.js`. Only put files in this public repository when you have the right to distribute them publicly.

## Private Audio For The Purple Button

The purple button can use a copyrighted or privately owned audio file without adding that file to GitHub. The file is selected on each phone or tablet and saved only inside that browser's private local storage. It is not uploaded by the app and it is not committed to the repository.

To set it up on a device:

1. Put the audio file somewhere the device's browser can pick it from. On iPhone, save it in the Files app, such as On My iPhone or iCloud Drive. On Android, save it in Files/Downloads/Drive or another file-provider location.
2. Open the app with `?setup=1` at the end of the URL. Example: `https://sargondj.github.io/freya-app/?setup=1`.
3. Tap `Private audio for purple button`, choose the audio file, and wait for the status message.
4. Use the `Open Freya buttons` link, or open the normal app URL again without `?setup=1`, for Freya's regular four-button screen.

Notes:

- MP3, M4A, AAC, and WAV are the safest formats across iPhone Safari and Android Chrome. The file picker explicitly allows `.mp3` because some mobile file providers do not advertise MP3 files as `audio/*`.
- Apple Music, Spotify, YouTube Music, and other streaming/DRM tracks usually cannot be selected as plain audio files. Use an audio file that the browser can access through the system file picker.
- This has to be configured separately on each device and browser. Clearing browser site data will remove the private audio selection.
- Browser pages cannot reliably force portrait orientation on iPhone and Android. The app requests portrait orientation in its web-app manifest and tries the Screen Orientation API after a tap, but unsupported browsers quietly ignore those requests. Installing the page to the home screen gives the browser the best chance of honoring portrait orientation.

## GitHub Pages

Publish the repository with GitHub Pages from the repository root. No build step is required.
